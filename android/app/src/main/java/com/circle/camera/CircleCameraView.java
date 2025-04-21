package com.circle.camera;

import android.content.Context;
import android.hardware.Camera;
import android.util.Log;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.view.Gravity;

import java.io.IOException;
import java.util.List;

@SuppressWarnings("deprecation")
public class CircleCameraView extends FrameLayout implements SurfaceHolder.Callback {
    private static final String TAG = "CircleCameraView";
    
    private SurfaceView surfaceView;
    private Camera camera;
    private int cameraId = Camera.CameraInfo.CAMERA_FACING_BACK;
    private boolean isPreviewing = false;
    private int rotation = 90; // Retrato por padrão - sempre vertical
    
    // Fixar aspect ratio em 3:4 (vertical)
    private static final float ASPECT_RATIO = 3.0f/4.0f; // Proporção vertical 3:4 (altura/largura)
    private boolean maintainAspectRatio = true;

    public CircleCameraView(Context context) {
        super(context);
        
        // Configurar layout
        setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));
        
        // Criar SurfaceView para preview da câmera
        surfaceView = new SurfaceView(context);
        
        // Usar um FrameLayout como container para podermos rotacionar a SurfaceView
        FrameLayout surfaceContainer = new FrameLayout(context);
        surfaceContainer.setLayoutParams(new LayoutParams(
                LayoutParams.MATCH_PARENT,
                LayoutParams.MATCH_PARENT,
                Gravity.CENTER
        ));
        
        // Configurar SurfaceView com rotação para modo retrato
        LayoutParams surfaceParams = new LayoutParams(
                LayoutParams.MATCH_PARENT,
                LayoutParams.MATCH_PARENT,
                Gravity.CENTER
        );
        surfaceView.setLayoutParams(surfaceParams);
        
        // Adicionar SurfaceView ao container
        surfaceContainer.addView(surfaceView);
        
        // Adicionar container à view principal
        addView(surfaceContainer);
        
        // Configurar SurfaceHolder
        SurfaceHolder holder = surfaceView.getHolder();
        holder.addCallback(this);
        holder.setType(SurfaceHolder.SURFACE_TYPE_PUSH_BUFFERS); // Necessário para versões antigas do Android
        
        // Aplicar rotação para forçar modo retrato
        setRotation(90);
    }

    @Override
    public void surfaceCreated(SurfaceHolder holder) {
        try {
            if (camera == null) {
                openCamera();
            }
            
            camera.setPreviewDisplay(holder);
            startPreview();
        } catch (IOException e) {
            Log.e(TAG, "Erro ao configurar preview: " + e.getMessage(), e);
        }
    }

    @Override
    public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
        if (camera == null) {
            return;
        }

        try {
            // Parar preview se estiver rodando
            if (isPreviewing) {
                camera.stopPreview();
                isPreviewing = false;
            }

            // Configurar parâmetros da câmera
            Camera.Parameters parameters = camera.getParameters();
            
            // Obter tamanho para o preview com base na proporção 3:4
            Camera.Size previewSize = getPreviewSizeFor34(parameters.getSupportedPreviewSizes());
            if (previewSize != null) {
                parameters.setPreviewSize(previewSize.width, previewSize.height);
                
                // Ajustar layout para manter a proporção 3:4
                post(() -> adjustViewTo34AspectRatio(previewSize.width, previewSize.height));
            }
            
            // Definir o melhor formato de imagem disponível
            List<Integer> supportedFormats = parameters.getSupportedPreviewFormats();
            if (supportedFormats != null && supportedFormats.contains(android.graphics.ImageFormat.NV21)) {
                parameters.setPreviewFormat(android.graphics.ImageFormat.NV21);
            }
            
            // Definir área de foco e medição
            if (parameters.getMaxNumFocusAreas() > 0) {
                parameters.setFocusMode(Camera.Parameters.FOCUS_MODE_AUTO);
            }
            
            // Aplicar parâmetros e iniciar preview
            camera.setParameters(parameters);
            
            // Configurar orientação da câmera (modo retrato)
            setCameraDisplayOrientation();
            
            camera.setPreviewDisplay(holder);
            camera.startPreview();
            isPreviewing = true;
            
            // Log da resolução final utilizada
            Camera.Size actualPreviewSize = camera.getParameters().getPreviewSize();
            Log.d(TAG, "Preview iniciado com resolução: " + actualPreviewSize.width + "x" + actualPreviewSize.height + 
                  " e proporção: " + ((float)actualPreviewSize.height / actualPreviewSize.width) +
                  " e rotação: " + rotation);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao configurar preview: " + e.getMessage(), e);
        }
    }

    @Override
    public void surfaceDestroyed(SurfaceHolder holder) {
        // Liberar a câmera quando a surface for destruída
        releaseCamera();
    }

    public void switchCamera() {
        // Alternar entre câmera frontal e traseira
        releaseCamera();
        
        cameraId = (cameraId == Camera.CameraInfo.CAMERA_FACING_BACK) 
                ? Camera.CameraInfo.CAMERA_FACING_FRONT 
                : Camera.CameraInfo.CAMERA_FACING_BACK;
        
        openCamera();
        
        try {
            camera.setPreviewDisplay(surfaceView.getHolder());
            
            // Configurar rotação e parâmetros
            camera.setDisplayOrientation(rotation);
            
            // Configurar para proporção 3:4 após mudar de câmera
            Camera.Parameters parameters = camera.getParameters();
            Camera.Size previewSize = getPreviewSizeFor34(parameters.getSupportedPreviewSizes());
            
            if (previewSize != null) {
                parameters.setPreviewSize(previewSize.width, previewSize.height);
                camera.setParameters(parameters);
                
                // Reajustar a view para proporção 3:4
                post(() -> adjustViewTo34AspectRatio(previewSize.width, previewSize.height));
            }
            
            startPreview();
        } catch (IOException e) {
            Log.e(TAG, "Erro ao alternar câmera: " + e.getMessage(), e);
        }
    }

    public void setFlashMode(String mode) {
        if (camera != null) {
            try {
                Camera.Parameters parameters = camera.getParameters();
                
                // Verificar se o dispositivo tem flash
                if (!parameters.getSupportedFlashModes().contains(Camera.Parameters.FLASH_MODE_ON)) {
                    Log.w(TAG, "Dispositivo não suporta flash");
                    return;
                }
                
                switch (mode) {
                    case "on":
                        parameters.setFlashMode(Camera.Parameters.FLASH_MODE_ON);
                        break;
                    case "off":
                        parameters.setFlashMode(Camera.Parameters.FLASH_MODE_OFF);
                        break;
                    case "auto":
                        parameters.setFlashMode(Camera.Parameters.FLASH_MODE_AUTO);
                        break;
                    case "torch":
                        parameters.setFlashMode(Camera.Parameters.FLASH_MODE_TORCH);
                        break;
                    default:
                        parameters.setFlashMode(Camera.Parameters.FLASH_MODE_OFF);
                        break;
                }
                
                camera.setParameters(parameters);
                Log.d(TAG, "Modo do flash alterado para: " + mode);
            } catch (Exception e) {
                Log.e(TAG, "Erro ao definir modo do flash: " + e.getMessage());
            }
        }
    }

    public void setZoom(float zoomValue) {
        if (camera != null) {
            try {
                Camera.Parameters parameters = camera.getParameters();
                
                if (parameters.isZoomSupported()) {
                    int maxZoom = parameters.getMaxZoom();
                    int zoom = (int) (zoomValue * maxZoom);
                    
                    // Garantir que o zoom esteja dentro dos limites
                    zoom = Math.max(0, Math.min(zoom, maxZoom));
                    
                    parameters.setZoom(zoom);
                    camera.setParameters(parameters);
                }
            } catch (Exception e) {
                Log.e(TAG, "Erro ao definir zoom: " + e.getMessage());
            }
        }
    }

    public void setFocusPoint(float x, float y) {
        if (camera != null) {
            try {
                Camera.Parameters parameters = camera.getParameters();
                
                if (parameters.getMaxNumFocusAreas() > 0) {
                    // Converter coordenadas de 0-1 para o sistema de coordenadas da câmera (-1000 a 1000)
                    int focusX = (int) ((x * 2 - 1) * 1000);
                    int focusY = (int) ((y * 2 - 1) * 1000);
                    
                    // Criar áreas de foco
                    List<Camera.Area> focusAreas = new java.util.ArrayList<>();
                    focusAreas.add(new Camera.Area(
                            new android.graphics.Rect(focusX - 100, focusY - 100, focusX + 100, focusY + 100), 
                            1000)
                    );
                    
                    parameters.setFocusAreas(focusAreas);
                    parameters.setFocusMode(Camera.Parameters.FOCUS_MODE_AUTO);
                    
                    camera.setParameters(parameters);
                    camera.autoFocus(null);
                }
            } catch (Exception e) {
                Log.e(TAG, "Erro ao definir ponto de foco: " + e.getMessage());
            }
        }
    }

    public void openCamera() {
        try {
            camera = Camera.open(cameraId);
            
            // Configurar câmera
            Camera.Parameters parameters = camera.getParameters();
            
            // Configurar orientação corretamente com base no tipo de câmera
            setCameraDisplayOrientation();
            
            // Aplicar parâmetros
            camera.setParameters(parameters);
            
        } catch (Exception e) {
            Log.e(TAG, "Erro ao abrir câmera: " + e.getMessage());
        }
    }

    // Método para definir a orientação correta da câmera - sempre em modo retrato (vertical)
    private void setCameraDisplayOrientation() {
        if (camera == null) return;
        
        Camera.CameraInfo info = new Camera.CameraInfo();
        Camera.getCameraInfo(cameraId, info);
        
        // Sempre forçar orientação em modo retrato (vertical)
        int displayRotation = 90; // Vertical
        
        // Calcular a orientação correta para o dispositivo
        int degrees = 0;
        int result;
        
        if (cameraId == Camera.CameraInfo.CAMERA_FACING_FRONT) {
            // Para câmera frontal em orientação retrato (vertical)
            result = (info.orientation + displayRotation) % 360;
            result = (360 - result) % 360;  // Compensação para câmera frontal
        } else {
            // Para câmera traseira em orientação retrato (vertical)
            result = (info.orientation - degrees + displayRotation) % 360;
        }
        
        Log.d(TAG, "Definindo orientação da câmera para: " + result + "° (cameraId: " + 
              cameraId + ", info.orientation: " + info.orientation + ", display: " + displayRotation + ")");
        
        // Aplicar rotação ao preview
        camera.setDisplayOrientation(result);
        
        // Salvar a rotação atual
        rotation = result;
        
        // Também precisamos definir a rotação para fotos capturadas
        Camera.Parameters parameters = camera.getParameters();
        
        // Definir rotação para as fotos - garantir que as fotos estejam em orientação vertical
        if (cameraId == Camera.CameraInfo.CAMERA_FACING_FRONT) {
            // Para câmera frontal, aplicamos uma rotação específica
            parameters.setRotation((info.orientation + 270) % 360);
            Log.d(TAG, "Rotação de captura para câmera frontal: " + ((info.orientation + 270) % 360) + "°");
        } else {
            // Para câmera traseira, mantemos a rotação vertical
            parameters.setRotation(90);
            Log.d(TAG, "Rotação de captura para câmera traseira: 90°");
        }
        
        camera.setParameters(parameters);
    }

    public void startPreview() {
        if (camera != null && !isPreviewing) {
            camera.startPreview();
            isPreviewing = true;
        }
    }

    public void stopPreview() {
        if (camera != null && isPreviewing) {
            camera.stopPreview();
            isPreviewing = false;
        }
    }

    public void releaseCamera() {
        if (camera != null) {
            stopPreview();
            camera.release();
            camera = null;
        }
    }

    public Camera getCamera() {
        return camera;
    }

    /**
     * Encontra o tamanho de preview mais adequado para uma proporção 3:4 vertical
     * 
     * @param sizes Lista de tamanhos suportados
     * @return O tamanho mais adequado para proporção 3:4
     */
    private Camera.Size getPreviewSizeFor34(List<Camera.Size> sizes) {
        if (sizes == null || sizes.isEmpty()) return null;
        
        Camera.Size optimalSize = null;
        double minDiff = Double.MAX_VALUE;
        
        // Procurar tamanho mais próximo da proporção 3:4 (vertical)
        for (Camera.Size size : sizes) {
            // Para orientação vertical precisamos inverter width/height
            // A câmera naturalmente captura em landscape, mas vamos girar para portrait
            double ratio = (double) size.height / size.width;
            double diff = Math.abs(ratio - ASPECT_RATIO);
            
            Log.d(TAG, "Tamanho: " + size.width + "x" + size.height + ", ratio: " + ratio + ", diff: " + diff);
            
            if (diff < minDiff) {
                optimalSize = size;
                minDiff = diff;
            }
        }
        
        Log.d(TAG, "Tamanho de preview selecionado: " + 
              (optimalSize != null ? (optimalSize.width + "x" + optimalSize.height) : "nenhum"));
        
        return optimalSize;
    }

    /**
     * Ajusta a view para exibir a câmera com proporção 3:4 vertical
     * 
     * @param previewWidth largura do preview da câmera
     * @param previewHeight altura do preview da câmera
     */
    public void adjustViewTo34AspectRatio(int previewWidth, int previewHeight) {
        Post.runOnUI(() -> {
            Log.d(TAG, "Ajustando proporção da view para 3:4 vertical");
            
            // Se a view ainda não tem dimensões, adiar o ajuste
            if (getWidth() == 0 || getHeight() == 0) {
                Log.d(TAG, "View ainda não tem dimensões, adiando ajuste");
                return;
            }
            
            // Para obter um display vertical 3:4
            float viewWidth = getWidth();
            float viewHeight = getHeight();
            float viewRatio = viewHeight / viewWidth;
            
            Log.d(TAG, "Dimensões da view: " + viewWidth + "x" + viewHeight + ", Proporção: " + viewRatio);
            Log.d(TAG, "Proporção desejada (3:4): " + ASPECT_RATIO);
            
            // Centralizar view com proporção 3:4
            if (maintainAspectRatio) {
                float newWidth, newHeight;
                
                if (Math.abs(viewRatio - ASPECT_RATIO) < 0.05) {
                    Log.d(TAG, "Já estamos na proporção 3:4, não ajustando");
                    return;
                }
                
                if (viewRatio > ASPECT_RATIO) {
                    // View atual é mais alta do que precisamos
                    newWidth = viewWidth;
                    newHeight = newWidth * ASPECT_RATIO;
                    Log.d(TAG, "View mais alta, ajustando altura: " + newWidth + "x" + newHeight);
                } else {
                    // View atual é mais larga do que precisamos
                    newHeight = viewHeight;
                    newWidth = newHeight / ASPECT_RATIO;
                    Log.d(TAG, "View mais larga, ajustando largura: " + newWidth + "x" + newHeight);
                }
                
                // Garantir que estamos dentro dos limites da view pai
                newWidth = Math.min(newWidth, getWidth());
                newHeight = Math.min(newHeight, getHeight());
                
                Log.d(TAG, "Dimensões finais após ajuste: " + newWidth + "x" + newHeight + 
                      ", Proporção: " + (newHeight / newWidth));
                
                LayoutParams params = new LayoutParams(
                    (int)newWidth,
                    (int)newHeight,
                    Gravity.CENTER
                );
                
                surfaceView.setLayoutParams(params);
                requestLayout();
            }
        });
    }

    public void setMaintainAspectRatio(boolean maintain) {
        this.maintainAspectRatio = maintain;
    }
    
    /**
     * Retorna a proporção de aspecto fixa 3:4
     * 
     * @return a proporção 3:4 (altura/largura)
     */
    public float getAspectRatio() {
        return ASPECT_RATIO;
    }

    /**
     * Define a rotação de exibição da câmera
     * 
     * @param rotation valor da rotação (0, 90, 180, 270)
     */
    public void setDisplayOrientation(int rotation) {
        if (camera == null) return;
        
        try {
            Camera.CameraInfo info = new Camera.CameraInfo();
            Camera.getCameraInfo(cameraId, info);
            
            int result;
            if (cameraId == Camera.CameraInfo.CAMERA_FACING_FRONT) {
                result = (info.orientation + rotation) % 360;
                result = (360 - result) % 360;  // Compensação para câmera frontal
            } else {
                result = (info.orientation - rotation + 360) % 360;
            }
            
            this.rotation = result;
            camera.setDisplayOrientation(result);
            
            // Atualizar também o parâmetro de rotação para fotos
            Camera.Parameters parameters = camera.getParameters();
            parameters.setRotation(result);
            camera.setParameters(parameters);
            
            // Verificar se precisamos reconfigurar o preview com o novo tamanho
            if (isPreviewing && getWidth() > 0 && getHeight() > 0) {
                Camera.Size previewSize = parameters.getPreviewSize();
                if (previewSize != null) {
                    post(() -> adjustViewTo34AspectRatio(previewSize.width, previewSize.height));
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Erro ao definir orientação da câmera: " + e.getMessage(), e);
        }
    }
} 