package com.circle.camera;

import android.annotation.SuppressLint;
import android.content.Context;
import android.util.Log;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import androidx.annotation.NonNull;
import androidx.camera.core.*;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.camera.view.PreviewView;
import androidx.core.content.ContextCompat;
import androidx.lifecycle.LifecycleOwner;
import com.google.common.util.concurrent.ListenableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import android.view.View;

public class CircleCameraView extends FrameLayout {
    private static final String TAG = "CircleCameraView";

    private PreviewView previewView;
    private ListenableFuture<ProcessCameraProvider> cameraProviderFuture;
    private ExecutorService cameraExecutor;
    private ImageCapture imageCapture;
    private Camera camera; // Para controle (zoom, foco, flash)
    private ProcessCameraProvider cameraProvider;

    private int lensFacing = CameraSelector.LENS_FACING_BACK; // Padrão: Câmera Traseira

    public CircleCameraView(@NonNull Context context) {
        super(context);
        init(context);
    }

    // Modificar init: Apenas inicializar variáveis, não iniciar CameraX
    private void init(Context context) {
        previewView = new PreviewView(context);
        previewView.setLayoutParams(new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT));
        previewView.setScaleType(PreviewView.ScaleType.FILL_CENTER);
        addView(previewView);

        cameraExecutor = Executors.newSingleThreadExecutor();
        // Não iniciar cameraProviderFuture ou addListener aqui
    }

    // Adicionar onAttachedToWindow para iniciar CameraX
    @Override
    protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        Log.d(TAG, "onAttachedToWindow - Iniciando CameraX.");
        startCamera(); // Nova função para encapsular início
    }

    // Adicionar onDetachedFromWindow para limpar CameraX
    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        Log.d(TAG, "onDetachedFromWindow - Desligando CameraX e Executor.");
        if (cameraProvider != null) {
            cameraProvider.unbindAll(); // Desvincular use cases
        }
        if (cameraExecutor != null) {
            cameraExecutor.shutdown();
        }
    }

    // Nova função para iniciar a câmera
    private void startCamera() {
        Context context = getContext();
        cameraProviderFuture = ProcessCameraProvider.getInstance(context);
        cameraProviderFuture.addListener(() -> {
            try {
                cameraProvider = cameraProviderFuture.get();
                Log.d(TAG, "CameraProvider obtido em startCamera. Tentando vincular Use Cases.");
                bindCameraUseCases();
            } catch (ExecutionException | InterruptedException e) {
                Log.e(TAG, "Erro ao obter CameraProvider em startCamera: ", e);
                 sendErrorToReact("Failed to get CameraProvider: " + e.getMessage());
            } catch (IllegalStateException e) {
                Log.e(TAG, "Contexto inválido para LifecycleOwner em startCamera: " + e.getMessage(), e);
                sendErrorToReact("Invalid context for LifecycleOwner: " + e.getMessage());
            }
        }, ContextCompat.getMainExecutor(context));
    }

    @SuppressLint("RestrictedApi")
    private void bindCameraUseCases() {
        if (cameraProvider == null) {
            Log.e(TAG, "CameraProvider não está pronto para vincular.");
             sendErrorToReact("CameraProvider not ready.");
            return;
        }

        LifecycleOwner lifecycleOwner = getLifecycleOwnerFromContext();
        if (lifecycleOwner == null) {
            Log.e(TAG, "ERRO CRÍTICO: Não foi possível obter um LifecycleOwner. CameraX não funcionará.");
            sendErrorToReact("Failed to get LifecycleOwner.");
            return;
        }

        // Limpar bindings anteriores
        cameraProvider.unbindAll();

        CameraSelector cameraSelector = new CameraSelector.Builder()
                .requireLensFacing(lensFacing)
                .build();

        Preview preview = new Preview.Builder()
                .setTargetRotation(previewView.getDisplay().getRotation())
                .build();
        preview.setSurfaceProvider(previewView.getSurfaceProvider());

        imageCapture = new ImageCapture.Builder()
                .setCaptureMode(ImageCapture.CAPTURE_MODE_MAXIMIZE_QUALITY)
                .setTargetRotation(previewView.getDisplay().getRotation())
                .build();

        try {
            camera = cameraProvider.bindToLifecycle(
                    lifecycleOwner, cameraSelector, preview, imageCapture);
            Log.i(TAG, "CameraX Use Cases vinculados com sucesso para lensFacing: " + lensFacing);

            // Iniciar foco automático contínuo se possível
            setupContinuousFocus();

        } catch (Exception e) {
            Log.e(TAG, "Falha ao vincular use cases: ", e);
             sendErrorToReact("Failed to bind camera use cases: " + e.getMessage());
        }
    }

    // Função auxiliar para obter LifecycleOwner
    private LifecycleOwner getLifecycleOwnerFromContext() {
        Context context = getContext();
        if (context instanceof LifecycleOwner) {
            return (LifecycleOwner) context;
        } else {
            Context activityContext = ReactContextUtils.getActivity(context);
            if (activityContext instanceof LifecycleOwner) {
                return (LifecycleOwner) activityContext;
            }
        }
        return null; // Retorna null se não encontrar
    }

     // Função auxiliar para configurar foco contínuo
    private void setupContinuousFocus() {
         if (camera != null) {
             MeteringPointFactory factory = previewView.getMeteringPointFactory();
             // Foco no centro da tela por padrão
             MeteringPoint point = factory.createPoint(previewView.getWidth() / 2f, previewView.getHeight() / 2f);
             FocusMeteringAction action = new FocusMeteringAction.Builder(point, FocusMeteringAction.FLAG_AF)
                    .disableAutoCancel() // Manter foco contínuo
                    .build();
             if (camera.getCameraInfo().isFocusMeteringSupported(action)) {
                 camera.getCameraControl().startFocusAndMetering(action);
                 Log.d(TAG, "Foco automático contínuo iniciado.");
             } else {
                 Log.w(TAG, "Foco automático contínuo não suportado.");
             }
         }
    }

    // --- Métodos Públicos (takePhoto, switchCamera, setZoom, setFocusPoint, setFlashMode) ---
    // Nenhuma mudança necessária aqui, já interagem com as variáveis da classe

     public void takePhoto(ImageCapture.OutputFileOptions outputFileOptions, ImageCapture.OnImageSavedCallback callback) {
        if (imageCapture != null) {
            Log.d(TAG, "Chamando imageCapture.takePicture...");
            imageCapture.takePicture(outputFileOptions, cameraExecutor, callback);
        } else {
            Log.e(TAG, "ImageCapture não inicializado ao tentar tirar foto.");
            callback.onError(new ImageCaptureException(ImageCapture.ERROR_INVALID_CAMERA, "ImageCapture not ready", null));
        }
     }

     public void switchCamera() {
        Log.d(TAG, "Chamado switchCamera()");
        lensFacing = (lensFacing == CameraSelector.LENS_FACING_BACK)
                ? CameraSelector.LENS_FACING_FRONT
                : CameraSelector.LENS_FACING_BACK;
        Log.d(TAG, "Novo lensFacing: " + lensFacing);
        bindCameraUseCases(); // Re-vincula com a nova câmera
     }

     public void setZoom(float linearZoom) {
        // Verificar se a câmera e o ZoomState estão disponíveis
        if (camera != null && camera.getCameraInfo().getZoomState().getValue() != null) {
            float clampedZoom = Math.max(0f, Math.min(1f, linearZoom));
             Log.d(TAG, "Definindo zoom linear para: " + clampedZoom);
            ListenableFuture<Void> future = camera.getCameraControl().setLinearZoom(clampedZoom);
            future.addListener(() -> {
                try {
                    future.get(); // Apenas para verificar erro
                } catch (Exception e) {
                    Log.e(TAG, "Falha assíncrona ao definir zoom: ", e);
                }
            }, ContextCompat.getMainExecutor(getContext()));
        } else {
             Log.w(TAG, "Zoom não suportado ou câmera não pronta.");
        }
     }

     public void setFocusPoint(float x, float y) {
        if (camera != null) {
            Log.d(TAG, "Chamado setFocusPoint em x=" + x + ", y=" + y);
            MeteringPointFactory factory = previewView.getMeteringPointFactory();
            MeteringPoint point = factory.createPoint(x * previewView.getWidth(), y * previewView.getHeight());
            FocusMeteringAction action = new FocusMeteringAction.Builder(point, FocusMeteringAction.FLAG_AF | FocusMeteringAction.FLAG_AE) // Foco e Exposição
                    .setAutoCancelDuration(5, TimeUnit.SECONDS) // Cancela após 5s
                    .build();

            if (!camera.getCameraInfo().isFocusMeteringSupported(action)) {
                 Log.w(TAG, "Ação de Foco/Metering não suportada.");
                 return;
            }

            ListenableFuture<FocusMeteringResult> future = camera.getCameraControl().startFocusAndMetering(action);
            future.addListener(() -> {
                try {
                    FocusMeteringResult result = future.get();
                    Log.d(TAG, "Foco/Metering concluído, sucesso AF: " + result.isFocusSuccessful());
                } catch (Exception e) {
                    Log.e(TAG, "Erro ao obter resultado do foco: ", e);
                }
            }, ContextCompat.getMainExecutor(getContext()));
        } else {
            Log.w(TAG, "Câmera não pronta para definir ponto de foco.");
        }
     }

     public void setFlashMode(String mode) {
        if (imageCapture != null) {
            int flashMode;
            switch (mode.toLowerCase()) {
                case "on":
                    flashMode = ImageCapture.FLASH_MODE_ON;
                    break;
                case "auto":
                    flashMode = ImageCapture.FLASH_MODE_AUTO;
                    break;
                case "off":
                default:
                    flashMode = ImageCapture.FLASH_MODE_OFF;
                    break;
            }
             try {
                imageCapture.setFlashMode(flashMode);
                Log.d(TAG, "Modo de flash do ImageCapture definido para: " + flashMode);
                // Para flash TORCH (lanterna), seria:
                // if (camera != null) camera.getCameraControl().enableTorch(mode.equalsIgnoreCase("torch"));
             } catch (IllegalArgumentException e) {
                 Log.e(TAG, "Modo de flash inválido: " + mode, e);
             }
        } else {
             Log.w(TAG, "ImageCapture não pronto para definir modo de flash.");
        }
     }

    // Adicionar método para enviar erro ao React Native (opcional, mas útil)
    private void sendErrorToReact(String errorMessage) {
        Log.e(TAG, "Enviando erro para React Native: " + errorMessage);
        // Implementar envio de evento onError aqui, se necessário
        // (Exigiria acesso ao ReactContext, geralmente obtido via ViewManager)
    }

    // --- Limpeza ---
    // onDetachedFromWindow já está implementado para limpar
}

// Classe ReactContextUtils permanece a mesma
class ReactContextUtils {
    static android.app.Activity getActivity(Context context) {
        if (context instanceof android.app.Activity) {
            return (android.app.Activity) context;
        } else if (context instanceof com.facebook.react.bridge.ReactContext) {
            return ((com.facebook.react.bridge.ReactContext) context).getCurrentActivity();
        } else if (context instanceof android.content.ContextWrapper) {
            return getActivity(((android.content.ContextWrapper) context).getBaseContext());
        }
        return null;
    }
} 