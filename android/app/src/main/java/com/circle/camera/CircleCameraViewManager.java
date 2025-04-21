package com.circle.camera;

import android.hardware.Camera;
import android.os.Environment;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.events.RCTEventEmitter;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class CircleCameraViewManager extends SimpleViewManager<CircleCameraView> {
    private static final String TAG = "CircleCameraViewManager";
    private static final String REACT_CLASS = "CircleCameraView";
    
    // Constante para aspect ratio fixo 3:4
    private static final float ASPECT_RATIO_3_4 = 3.0f/4.0f;
    
    // Constantes para eventos
    private static final String EVENT_CAMERA_READY = "onCameraReady";
    private static final String EVENT_TAKE_PHOTO = "onTakePhoto";
    private static final String EVENT_ERROR = "onError";
    private static final String EVENT_BARCODE_READ = "onBarCodeRead";
    private static final String EVENT_FACE_DETECTED = "onFaceDetected";
    
    // Constantes para comandos
    private static final int COMMAND_TAKE_PHOTO = 1;
    private static final int COMMAND_SWITCH_CAMERA = 2;
    private static final int COMMAND_SET_FOCUS_POINT = 3;

    private ThemedReactContext reactContext;

    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @NonNull
    @Override
    protected CircleCameraView createViewInstance(@NonNull ThemedReactContext reactContext) {
        this.reactContext = reactContext;
        return new CircleCameraView(reactContext);
    }

    @ReactProp(name = "cameraType")
    public void setCameraType(CircleCameraView view, String cameraType) {
        try {
            // Verificar se precisamos alternar a câmera
            boolean isFrontCamera = "front".equals(cameraType);
            int desiredCameraId = isFrontCamera ? 
                    Camera.CameraInfo.CAMERA_FACING_FRONT : 
                    Camera.CameraInfo.CAMERA_FACING_BACK;
            
            // Alternar apenas se for diferente da atual
            if (view.getCamera() != null) {
                Camera.CameraInfo info = new Camera.CameraInfo();
                Camera.getCameraInfo(0, info);
                
                if ((isFrontCamera && info.facing != Camera.CameraInfo.CAMERA_FACING_FRONT) ||
                    (!isFrontCamera && info.facing != Camera.CameraInfo.CAMERA_FACING_BACK)) {
                    view.switchCamera();
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Erro ao definir tipo de câmera: " + e.getMessage());
            sendErrorEvent("Falha ao alterar câmera: " + e.getMessage());
        }
    }

    @ReactProp(name = "flashMode")
    public void setFlashMode(CircleCameraView view, String flashMode) {
        view.setFlashMode(flashMode);
    }

    @ReactProp(name = "zoom")
    public void setZoom(CircleCameraView view, float zoom) {
        view.setZoom(zoom);
    }

    @ReactProp(name = "maintainAspectRatio", defaultBoolean = true)
    public void setMaintainAspectRatio(CircleCameraView view, boolean maintain) {
        view.setMaintainAspectRatio(maintain);
        
        // Se a câmera já estiver ativa, ajustar a view
        if (view.getCamera() != null && view.getWidth() > 0 && view.getHeight() > 0) {
            Camera.Parameters parameters = view.getCamera().getParameters();
            Camera.Size previewSize = parameters.getPreviewSize();
            
            if (previewSize != null) {
                view.post(() -> view.adjustViewTo34AspectRatio(previewSize.width, previewSize.height));
            }
        }
    }

    @ReactProp(name = "aspectRatio", defaultFloat = 0.75f) // 3:4
    public void setAspectRatio(CircleCameraView view, float aspectRatio) {
        // A proporção já é fixada em 3:4 no nativo, mas logamos o valor para debug
        Log.d(TAG, "Recebido aspectRatio do React Native: " + aspectRatio + 
              " (usando fixo 3:4=" + ASPECT_RATIO_3_4 + ")");
        
        // Se a câmera já estiver ativa, ajustar a view
        if (view.getCamera() != null && view.getWidth() > 0 && view.getHeight() > 0) {
            Camera.Parameters parameters = view.getCamera().getParameters();
            Camera.Size previewSize = parameters.getPreviewSize();
            
            if (previewSize != null) {
                view.post(() -> view.adjustViewTo34AspectRatio(previewSize.width, previewSize.height));
            }
        }
    }

    @Nullable
    @Override
    public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
        return MapBuilder.<String, Object>builder()
                .put(EVENT_CAMERA_READY, MapBuilder.of("registrationName", EVENT_CAMERA_READY))
                .put(EVENT_TAKE_PHOTO, MapBuilder.of("registrationName", EVENT_TAKE_PHOTO))
                .put(EVENT_ERROR, MapBuilder.of("registrationName", EVENT_ERROR))
                .put(EVENT_BARCODE_READ, MapBuilder.of("registrationName", EVENT_BARCODE_READ))
                .put(EVENT_FACE_DETECTED, MapBuilder.of("registrationName", EVENT_FACE_DETECTED))
                .build();
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
    public void receiveCommand(@NonNull CircleCameraView root, int commandId, @Nullable ReadableArray args) {
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
                    root.setFocusPoint(x, y);
                }
                break;
            default:
                super.receiveCommand(root, commandId, args);
                break;
        }
    }

    private void takePhoto(final CircleCameraView view) {
        if (view.getCamera() == null) {
            sendErrorEvent("Camera not available");
            return;
        }

        try {
            // Configurar parâmetros da câmera para a captura
            Camera.Parameters params = view.getCamera().getParameters();
            if (params.getSupportedFocusModes().contains(Camera.Parameters.FOCUS_MODE_AUTO)) {
                params.setFocusMode(Camera.Parameters.FOCUS_MODE_AUTO);
            }
            
            // Configurar qualidade da imagem para a melhor possível
            params.setJpegQuality(100);
            
            // Usar a proporção fixa 3:4 vertical
            Camera.Size bestSize = getBestPictureSizeFor34(params.getSupportedPictureSizes());
            
            if (bestSize != null) {
                params.setPictureSize(bestSize.width, bestSize.height);
            }
            
            view.getCamera().setParameters(params);
            
            // Desconectar o preview do holder para evitar conflito durante captura
            view.getCamera().setPreviewCallback(null);
            
            // Focar antes de tirar a foto
            try {
                view.getCamera().autoFocus((success, camera) -> {
                    // Após focar, capturar a imagem
                    camera.takePicture(
                        // ShutterCallback
                        () -> {
                            // Som do obturador, se necessário
                        },
                        // RawCallback (null para não processar dados raw)
                        null,
                        // JpegCallback
                        (data, camera1) -> {
                            try {
                                // Criar arquivo temporário para a foto
                                File pictureFile = createImageFile();
                                
                                // Salvar dados da imagem no arquivo
                                try (FileOutputStream fos = new FileOutputStream(pictureFile)) {
                                    fos.write(data);
                                    fos.flush();
                                }
                                
                                // Obter dimensões da imagem
                                Camera.Parameters parameters = camera1.getParameters();
                                Camera.Size size = parameters.getPictureSize();
                                
                                // Enviar evento com o caminho do arquivo
                                sendPhotoTakenEvent(pictureFile.getAbsolutePath(), size.width, size.height);
                                
                                // Reiniciar preview
                                try {
                                    camera1.startPreview();
                                } catch (Exception ex) {
                                    sendErrorEvent("Erro ao reiniciar preview: " + ex.getMessage());
                                }
                            } catch (IOException ioException) {
                                sendErrorEvent("Erro ao salvar foto: " + ioException.getMessage());
                            }
                        }
                    );
                });
            } catch (Exception autoFocusException) {
                // Se não puder focar automaticamente, tirar foto diretamente
                view.getCamera().takePicture(null, null, (data, camera) -> {
                    try {
                        // Criar arquivo temporário para a foto
                        File pictureFile = createImageFile();
                        
                        // Salvar dados da imagem no arquivo
                        try (FileOutputStream fos = new FileOutputStream(pictureFile)) {
                            fos.write(data);
                            fos.flush();
                        }
                        
                        // Obter dimensões da imagem
                        Camera.Parameters parameters = camera.getParameters();
                        Camera.Size size = parameters.getPictureSize();
                        
                        // Enviar evento com o caminho do arquivo
                        sendPhotoTakenEvent(pictureFile.getAbsolutePath(), size.width, size.height);
                        
                        // Reiniciar preview
                        camera.startPreview();
                    } catch (IOException ioException) {
                        sendErrorEvent("Erro ao salvar foto: " + ioException.getMessage());
                    }
                });
            }
        } catch (Exception cameraException) {
            sendErrorEvent("Erro ao tirar foto: " + cameraException.getMessage());
        }
    }
    
    /**
     * Encontra o melhor tamanho de foto para proporção 3:4 vertical
     * 
     * @param sizes Lista de tamanhos suportados
     * @return O melhor tamanho que mantém proporção 3:4
     */
    private Camera.Size getBestPictureSizeFor34(List<Camera.Size> sizes) {
        if (sizes == null || sizes.isEmpty()) {
            return null;
        }
        
        Log.d(TAG, "Buscando tamanho de foto com proporção 3:4 vertical");
        
        // Encontrar o melhor tamanho que mantenha a proporção 3:4
        Camera.Size bestSize = null;
        double minDiff = Double.MAX_VALUE;
        
        for (Camera.Size size : sizes) {
            // Calcular proporção para orientação vertical (invertemos a relação)
            double ratio = (double) size.height / size.width; 
            double diff = Math.abs(ratio - ASPECT_RATIO_3_4);
            
            // Log de debug para conferir as proporções
            Log.d(TAG, "Tamanho disponível: " + size.width + "x" + size.height + 
                  " (proporção vertical: " + ratio + "), diff: " + diff);
            
            if (diff < minDiff) {
                bestSize = size;
                minDiff = diff;
            }
        }
        
        if (bestSize != null) {
            double resultRatio = (double) bestSize.height / bestSize.width;
            Log.d(TAG, "Tamanho de foto selecionado para 3:4 vertical: " + bestSize.width + "x" + bestSize.height + 
                   " (proporção vertical: " + resultRatio + ")");
            return bestSize;
        }
        
        // Fallback para maior resolução disponível
        return getBestPictureSize(sizes);
    }

    // Método auxiliar para obter a maior resolução disponível
    private Camera.Size getBestPictureSize(List<Camera.Size> sizes) {
        if (sizes == null || sizes.isEmpty()) {
            return null;
        }
        
        Camera.Size bestSize = sizes.get(0);
        for (Camera.Size size : sizes) {
            if (size.width * size.height > bestSize.width * bestSize.height) {
                bestSize = size;
            }
        }
        
        return bestSize;
    }

    private File createImageFile() throws IOException {
        // Criar nome de arquivo único baseado na data e hora
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date());
        String imageFileName = "IMG_" + timeStamp + "_";
        File storageDir = reactContext.getExternalFilesDir(Environment.DIRECTORY_PICTURES);
        return File.createTempFile(imageFileName, ".jpg", storageDir);
    }

    private void sendPhotoTakenEvent(String path, int width, int height) {
        WritableMap event = Arguments.createMap();
        event.putString("path", "file://" + path);
        event.putInt("width", width);
        event.putInt("height", height);
        
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("onTakePhoto", event);
    }
    
    private void sendErrorEvent(String errorMessage) {
        WritableMap event = Arguments.createMap();
        event.putString("error", errorMessage);
        
        if (reactContext != null) {
            reactContext.getJSModule(RCTEventEmitter.class)
                    .receiveEvent(0, EVENT_ERROR, event);
        }
    }
} 