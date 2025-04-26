package com.circle.camera;

import android.content.Context;
import android.os.Environment;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.camera.core.ImageCapture;
import androidx.camera.core.ImageCaptureException;
import androidx.lifecycle.LifecycleOwner;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.events.RCTEventEmitter;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.Map;

public class CircleCameraViewManager extends SimpleViewManager<CircleCameraView> {
    private static final String REACT_CLASS = "CircleCameraView";
    
    // Constantes para eventos
    private static final String EVENT_CAMERA_READY = "onCameraReady";
    private static final String EVENT_TAKE_PHOTO = "onTakePhoto";
    private static final String EVENT_ERROR = "onError";
    
    // Constantes para comandos
    private static final int COMMAND_TAKE_PHOTO = 1;
    private static final int COMMAND_SWITCH_CAMERA = 4;
    private static final int COMMAND_SET_FOCUS_POINT = 5;

    // *** NOVOS Códigos de Erro ***
    public static final String E_GENERAL = "E_CAMERA_GENERAL";
    public static final String E_CAMERA_PROVIDER_FAILURE = "E_CAMERA_PROVIDER";
    public static final String E_LIFECYCLE_OWNER_UNAVAILABLE = "E_LIFECYCLE_OWNER";
    public static final String E_BINDING_FAILURE = "E_BINDING_FAILURE";
    public static final String E_CAPTURE_FAILURE = "E_CAPTURE_FAILURE";
    public static final String E_FILE_CREATION_FAILURE = "E_FILE_CREATION";
    public static final String E_INVALID_CONTEXT = "E_INVALID_CONTEXT";

    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @NonNull
    @Override
    protected CircleCameraView createViewInstance(@NonNull ThemedReactContext reactContext) {
        if (!(ReactContextUtils.getActivity(reactContext) instanceof LifecycleOwner)) {
             Log.e(REACT_CLASS, "ERRO FATAL: Não foi possível obter LifecycleOwner da Activity. CameraX não funcionará.");
             return new CircleCameraView(reactContext);
        }
         Log.d(REACT_CLASS, "Criando instância de CircleCameraView com CameraX.");
        return new CircleCameraView(reactContext);
    }

    @ReactProp(name = "flashMode")
    public void setFlashMode(CircleCameraView view, String flashMode) {
        if (flashMode != null) {
            view.setFlashMode(flashMode);
        }
    }

    @ReactProp(name = "zoom")
    public void setZoom(CircleCameraView view, float zoom) {
        view.setZoom(zoom);
    }

    @Nullable
    @Override
    public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
        MapBuilder.Builder<String, Object> builder = MapBuilder.builder();
        builder.put(EVENT_TAKE_PHOTO, MapBuilder.of("registrationName", EVENT_TAKE_PHOTO));
        builder.put(EVENT_ERROR, MapBuilder.of("registrationName", EVENT_ERROR));
        return builder.build();
    }

    @Nullable
    @Override
    public Map<String, Integer> getCommandsMap() {
        return MapBuilder.of(
                "takePhoto", COMMAND_TAKE_PHOTO,
                "switchCamera", COMMAND_SWITCH_CAMERA,
                "setFocusPoint", COMMAND_SET_FOCUS_POINT
        );
    }

    @Override
    public void receiveCommand(@NonNull CircleCameraView root, String commandIdStr, @Nullable ReadableArray args) {
        int commandId = -1;
        try {
            commandId = Integer.parseInt(commandIdStr);
        } catch (NumberFormatException e) {
            Log.e(REACT_CLASS, "Comando inválido recebido: " + commandIdStr, e);
            sendErrorEvent(root, E_GENERAL, "Comando inválido recebido: " + commandIdStr);
            return;
        }
        Log.d(REACT_CLASS, "Comando recebido: " + commandIdStr + " (" + commandId + ")");

        switch (commandId) {
            case COMMAND_TAKE_PHOTO:
                takePhoto(root);
                break;
            case COMMAND_SWITCH_CAMERA:
                root.switchCamera();
                break;
            case COMMAND_SET_FOCUS_POINT:
                if (args != null && args.size() >= 2) {
                    float x = (float) args.getDouble(0);
                    float y = (float) args.getDouble(1);
                     Log.d(REACT_CLASS, "Recebido setFocusPoint para x=" + x + ", y=" + y);
                    root.setFocusPoint(x, y);
                } else {
                     Log.w(REACT_CLASS, "Argumentos inválidos para setFocusPoint.");
                     sendErrorEvent(root, E_GENERAL, "Argumentos inválidos para setFocusPoint.");
                 }
                break;
            default:
                 Log.w(REACT_CLASS, "Comando desconhecido recebido: " + commandId);
                break;
        }
    }

    private void takePhoto(final CircleCameraView view) {
        Context context = view.getContext();
        File photoFile = createImageFile(context);
        if (photoFile == null) {
            sendErrorEvent(view, E_FILE_CREATION_FAILURE, "Não foi possível criar arquivo para a foto.");
            return;
        }

        Log.d(REACT_CLASS, "Preparando para tirar foto. Arquivo: " + photoFile.getAbsolutePath());
        ImageCapture.OutputFileOptions outputOptions =
                new ImageCapture.OutputFileOptions.Builder(photoFile).build();

        view.takePhoto(outputOptions, new ImageCapture.OnImageSavedCallback() {
            @Override
            public void onImageSaved(@NonNull ImageCapture.OutputFileResults outputFileResults) {
                String path = photoFile.getAbsolutePath();
                Log.i(REACT_CLASS, "Foto salva com sucesso: " + path);
                sendPhotoTakenEvent(view, path, 0, 0);
            }

            @Override
            public void onError(@NonNull ImageCaptureException exception) {
                String errorMsg = "Erro ao salvar foto com CameraX: (" + exception.getImageCaptureError() + ") " + exception.getMessage();
                Log.e(REACT_CLASS, errorMsg, exception);
                sendErrorEvent(view, E_CAPTURE_FAILURE, errorMsg);
            }
        });
    }

    private File createImageFile(Context context) {
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date());
        String imageFileName = "IMG_" + timeStamp + "_";
        File storageDir = context.getExternalCacheDir();
        if (storageDir == null) {
             Log.e(REACT_CLASS, "Diretório de armazenamento externo é nulo.");
             return null;
        }
        try {
            File file = File.createTempFile(imageFileName, ".jpg", storageDir);
             Log.d(REACT_CLASS, "Arquivo de imagem criado: " + file.getAbsolutePath());
             return file;
        } catch (IOException e) {
            Log.e(REACT_CLASS, "Erro ao criar arquivo de imagem", e);
            return null;
        }
    }

    private void sendPhotoTakenEvent(CircleCameraView view, String path, int width, int height) {
        WritableMap event = Arguments.createMap();
        event.putString("path", "file://" + path);
        event.putInt("width", width);
        event.putInt("height", height);
        
        ReactContext reactContext = (ReactContext) view.getContext();
         Log.d(REACT_CLASS, "Enviando evento onTakePhoto: " + event.toString());
        try {
            reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                view.getId(),
                EVENT_TAKE_PHOTO,
                event
            );
        } catch (Exception e) {
             Log.e(REACT_CLASS, "Erro ao enviar evento onTakePhoto", e);
         }
    }
    
    private void sendErrorEvent(CircleCameraView view, String errorCode, String errorMessage) {
        WritableMap event = Arguments.createMap();
        event.putString("code", errorCode);
        event.putString("message", errorMessage);
        
        ReactContext reactContext = (ReactContext) view.getContext();
         Log.d(REACT_CLASS, "Enviando evento onError: " + event.toString());
        try {
            reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                view.getId(),
                EVENT_ERROR,
                event
            );
         } catch (Exception e) {
             Log.e(REACT_CLASS, "Erro ao enviar evento onError", e);
         }
    }

    // *** NOVO MÉTODO público para a View chamar ***
    public void dispatchErrorEvent(CircleCameraView view, String errorCode, String errorMessage) {
        sendErrorEvent(view, errorCode, errorMessage);
    }
} 