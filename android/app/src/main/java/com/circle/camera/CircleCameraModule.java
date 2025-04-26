package com.circle.camera;

import android.Manifest;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.ImageFormat;
import android.graphics.Matrix;
import android.hardware.Camera;
import android.media.CamcorderProfile;
import android.media.MediaRecorder;
import android.os.Environment;
import android.util.Log;
import android.view.Surface;
import android.view.SurfaceHolder;
import android.view.SurfaceView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@SuppressWarnings("deprecation")
public class CircleCameraModule extends ReactContextBaseJavaModule implements SurfaceHolder.Callback {
    private static final String TAG = "CircleCameraModule";
    private static final String MODULE_NAME = "CircleCamera";

    // Constantes
    private static final int PERMISSION_REQUEST_CAMERA = 1001;
    private static final int PERMISSION_REQUEST_AUDIO = 1002;
    private static final int PERMISSION_REQUEST_STORAGE = 1003;

    // Estados
    private boolean isInitialized = false;
    private boolean isActive = false;
    private boolean isRecording = false;
    
    // Componentes da câmera
    private Camera camera;
    private MediaRecorder mediaRecorder;
    private SurfaceHolder surfaceHolder;
    private SurfaceView surfaceView;
    
    // Configurações
    private int cameraId = Camera.CameraInfo.CAMERA_FACING_BACK;
    private String flashMode = Camera.Parameters.FLASH_MODE_OFF;
    private float zoom = 0;
    private String currentFilter = "normal";
    private Map<String, Object> filterParams = new HashMap<>();
    
    // Paths para armazenamento
    private String photoPath;
    private String videoPath;
    private File mediaStorageDir;

    // Construtor
    public CircleCameraModule(ReactApplicationContext reactContext) {
        super(reactContext);
        
        // Criar diretório para armazenamento de mídia
        mediaStorageDir = new File(
                Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DCIM),
                "Circle"
        );
        
        if (!mediaStorageDir.exists()) {
            if (!mediaStorageDir.mkdirs()) {
                Log.e(TAG, "Falha ao criar diretório para armazenamento de mídia");
            }
        }
    }

    @NonNull
    @Override
    public String getName() {
        return MODULE_NAME;
    }

    // Métodos de inicialização
    @ReactMethod
    public void initialize(Promise promise) {
        if (isInitialized) {
            promise.resolve(true);
            return;
        }

        try {
            Log.d(TAG, "Inicializando módulo de câmera");
            
            // Verificar permissões (a verificação real aconteceria na Activity)
            if (!hasRequiredPermissions()) {
                Log.w(TAG, "Permissões não concedidas. O módulo pode não funcionar corretamente.");
            }
            
            isInitialized = true;
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao inicializar módulo de câmera", e);
            promise.reject("INIT_ERROR", "Falha ao inicializar câmera: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void startCamera(Promise promise) {
        if (!isInitialized) {
            initialize(promise);
            return;
        }
        
        try {
            if (isActive) {
                promise.resolve(true);
                return;
            }
            
            Log.d(TAG, "Iniciando câmera");
            
            // Aqui abriríamos a câmera
            // Na implementação real, precisaríamos de um SurfaceView para exibir o preview
            openCamera();
            
            isActive = true;
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao iniciar câmera", e);
            promise.reject("START_ERROR", "Falha ao iniciar câmera: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void stopCamera(Promise promise) {
        try {
            if (isRecording) {
                stopRecording(promise);
                return;
            }
            
            if (!isActive) {
                promise.resolve(true);
                return;
            }
            
            Log.d(TAG, "Parando câmera");
            releaseCamera();
            
            isActive = false;
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao parar câmera", e);
            promise.reject("STOP_ERROR", "Falha ao parar câmera: " + e.getMessage(), e);
        }
    }

    // Controles de câmera
    @ReactMethod
    public void switchCamera(Promise promise) {
        try {
            Log.d(TAG, "Alternando câmera");
            
            // Liberar a câmera atual
            if (camera != null) {
                camera.stopPreview();
                camera.release();
                camera = null;
            }
            
            // Alternar entre câmera frontal e traseira
            cameraId = (cameraId == Camera.CameraInfo.CAMERA_FACING_BACK) 
                    ? Camera.CameraInfo.CAMERA_FACING_FRONT 
                    : Camera.CameraInfo.CAMERA_FACING_BACK;
            
            // Reabrir a câmera com o novo ID
            openCamera();
            
            promise.resolve(null);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao alternar câmera", e);
            promise.reject("SWITCH_ERROR", "Falha ao alternar câmera: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void setFlashMode(String mode, Promise promise) {
        try {
            Log.d(TAG, "Definindo modo de flash para: " + mode);
            
            if (camera != null) {
                Camera.Parameters parameters = camera.getParameters();
                
                switch (mode) {
                    case "on":
                        parameters.setFlashMode(Camera.Parameters.FLASH_MODE_ON);
                        break;
                    case "auto":
                        parameters.setFlashMode(Camera.Parameters.FLASH_MODE_AUTO);
                        break;
                    case "off":
                    default:
                        parameters.setFlashMode(Camera.Parameters.FLASH_MODE_OFF);
                        break;
                }
                
                camera.setParameters(parameters);
            }
            
            flashMode = mode;
            promise.resolve(null);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao definir modo de flash", e);
            promise.reject("FLASH_ERROR", "Falha ao definir modo de flash: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void setZoom(float zoomValue, Promise promise) {
        try {
            Log.d(TAG, "Definindo zoom para: " + zoomValue);
            
            if (camera != null) {
                Camera.Parameters parameters = camera.getParameters();
                
                if (parameters.isZoomSupported()) {
                    int maxZoom = parameters.getMaxZoom();
                    int scaledZoom = (int) (zoomValue * maxZoom);
                    parameters.setZoom(scaledZoom);
                    camera.setParameters(parameters);
                } else {
                    Log.w(TAG, "Zoom não suportado por esta câmera");
                }
            }
            
            zoom = zoomValue;
            promise.resolve(null);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao definir zoom", e);
            promise.reject("ZOOM_ERROR", "Falha ao definir zoom: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void setFocusPoint(float x, float y, Promise promise) {
        try {
            Log.d(TAG, "Focando em: (" + x + ", " + y + ")");
            
            if (camera != null) {
                Camera.Parameters parameters = camera.getParameters();
                
                if (parameters.getMaxNumFocusAreas() > 0) {
                    // Converter as coordenadas normalizadas (0-1) para o intervalo de foco da câmera (-1000 a 1000)
                    int focusX = (int) ((x * 2 - 1) * 1000);
                    int focusY = (int) ((y * 2 - 1) * 1000);
                    
                    List<Camera.Area> focusAreas = new ArrayList<>();
                    focusAreas.add(new Camera.Area(
                            new android.graphics.Rect(focusX - 100, focusY - 100, focusX + 100, focusY + 100), 
                            1000));
                    
                    parameters.setFocusAreas(focusAreas);
                    camera.setParameters(parameters);
                    
                    // Auto-foco
                    camera.autoFocus(null);
                } else {
                    Log.w(TAG, "Foco por toque não suportado por esta câmera");
                }
            }
            
            promise.resolve(null);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao definir ponto de foco", e);
            promise.reject("FOCUS_ERROR", "Falha ao definir ponto de foco: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void startRecording(Promise promise) {
        try {
            if (!isActive) {
                startCamera(new Promise() {
                    @Override
                    public void resolve(@Nullable Object value) {
                        // Continue com a gravação
                        startRecordingAfterCameraStart(promise);
                    }
                    
                    @Override
                    public void reject(String code, String message) {
                        promise.reject(code, message);
                    }
                    
                    @Override
                    public void reject(String code, Throwable throwable) {
                        promise.reject(code, throwable);
                    }
                    
                    @Override
                    public void reject(String code, String message, Throwable throwable) {
                        promise.reject(code, message, throwable);
                    }
                    
                    @Override
                    public void reject(Throwable throwable) {
                        promise.reject("CAMERA_ERROR", throwable.getMessage(), throwable);
                    }
                    
                    public void reject(Throwable throwable, String message) {
                        promise.reject("CAMERA_ERROR", message, throwable);
                    }
                    
                    @Override
                    public void reject(String code, String message, Throwable throwable, WritableMap userInfo) {
                        promise.reject(code, message, throwable);
                    }
                    
                    @Override
                    public void reject(String code, Throwable throwable, WritableMap userInfo) {
                        promise.reject(code, throwable);
                    }

                    @Override
                    public void reject(Throwable throwable, WritableMap userInfo) {
                        promise.reject("CAMERA_ERROR", throwable);
                    }
                    
                    @Override
                    public void reject(String code, String message, WritableMap userInfo) {
                        promise.reject(code, message);
                    }
                    
                    @Override
                    public void reject(String code) {
                        promise.reject(code, "Erro ao iniciar câmera");
                    }
                    
                    @Override
                    public void reject(String code, WritableMap userInfo) {
                        promise.reject(code, "Erro ao iniciar câmera");
                    }
                });
                return;
            }
            
            startRecordingAfterCameraStart(promise);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao iniciar gravação", e);
            promise.reject("RECORDING_ERROR", "Falha ao iniciar gravação: " + e.getMessage(), e);
        }
    }
    
    private void startRecordingAfterCameraStart(Promise promise) {
        try {
            if (isRecording) {
                promise.resolve(true);
                return;
            }
            
            Log.d(TAG, "Iniciando gravação");
            
            if (camera == null) {
                promise.reject("CAMERA_ERROR", "Câmera não disponível");
                return;
            }
            
            // Reiniciar a câmera para garantir que estamos no modo de gravação
            camera.unlock();
            
            // Configurar o MediaRecorder
            mediaRecorder = new MediaRecorder();
            mediaRecorder.setCamera(camera);
            mediaRecorder.setAudioSource(MediaRecorder.AudioSource.CAMCORDER);
            mediaRecorder.setVideoSource(MediaRecorder.VideoSource.CAMERA);
            
            // Perfil de qualidade
            CamcorderProfile profile = CamcorderProfile.get(CamcorderProfile.QUALITY_HIGH);
            mediaRecorder.setProfile(profile);
            
            // Criar arquivo para o vídeo
            File videoFile = createVideoFile();
            if (videoFile == null) {
                promise.reject("FILE_ERROR", "Não foi possível criar arquivo para vídeo");
                return;
            }
            
            videoPath = videoFile.getAbsolutePath();
            mediaRecorder.setOutputFile(videoPath);
            
            // Se tivéssemos uma surface para preview:
            // mediaRecorder.setPreviewDisplay(surfaceHolder.getSurface());
            
            try {
                mediaRecorder.prepare();
                mediaRecorder.start();
                isRecording = true;
                promise.resolve(true);
            } catch (IOException e) {
                Log.e(TAG, "Erro ao preparar MediaRecorder", e);
                releaseMediaRecorder();
                promise.reject("RECORDING_ERROR", "Erro ao preparar gravação: " + e.getMessage(), e);
            }
        } catch (Exception e) {
            Log.e(TAG, "Erro ao iniciar gravação", e);
            promise.reject("RECORDING_ERROR", "Falha ao iniciar gravação: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void stopRecording(Promise promise) {
        if (!isRecording || mediaRecorder == null) {
            promise.reject("E_RECORDING_ERROR", "Não há gravação em andamento");
            return;
        }

        try {
            mediaRecorder.stop();
            isRecording = false;
            
            // Emitir evento quando a gravação é concluída
            WritableMap params = Arguments.createMap();
            params.putString("path", videoPath);
            
            ReactContext reactContext = getReactApplicationContext();
            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("onRecordingFinished", params);
            
            // Resolver a promise com o caminho do vídeo
            WritableMap result = Arguments.createMap();
            result.putString("path", videoPath);
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("E_RECORDING_ERROR", "Erro ao parar gravação: " + e.getMessage(), e);
        } finally {
            releaseMediaRecorder();
        }
    }

    // Filtros e processamento
    @ReactMethod
    public void setFilter(String filterId, Promise promise) {
        try {
            Log.d(TAG, "Definindo filtro: " + filterId);
            
            // Aqui implementaríamos a lógica de aplicação de filtros
            // Esta é uma versão simulada
            currentFilter = filterId;
            
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao definir filtro", e);
            promise.reject("FILTER_ERROR", "Falha ao definir filtro: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void setCustomFilter(String glslCode, Promise promise) {
        try {
            Log.d(TAG, "Definindo filtro personalizado");
            
            // Aqui implementaríamos a lógica de compilação de shaders GLSL
            // Esta é uma versão simulada
            
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao definir filtro personalizado", e);
            promise.reject("FILTER_ERROR", "Falha ao definir filtro personalizado: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void setFilterWithParameters(String filterType, ReadableMap params, Promise promise) {
        try {
            Log.d(TAG, "Definindo filtro " + filterType + " com parâmetros");
            
            // Aqui implementaríamos a lógica de aplicação de filtros com parâmetros
            // Esta é uma versão simulada
            currentFilter = filterType;
            
            // Converter parâmetros para um Map Java
            filterParams.clear();
            if (params != null) {
                for (Map.Entry<String, Object> entry : params.toHashMap().entrySet()) {
                    filterParams.put(entry.getKey(), entry.getValue());
                }
            }
            
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao definir filtro com parâmetros", e);
            promise.reject("FILTER_ERROR", "Falha ao definir filtro com parâmetros: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void setFilterConfig(ReadableMap config, Promise promise) {
        try {
            Log.d(TAG, "Definindo configuração de filtro");
            
            // Aqui implementaríamos a lógica de configuração de filtros
            // Esta é uma versão simulada
            
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao definir configuração de filtro", e);
            promise.reject("FILTER_ERROR", "Falha ao definir configuração de filtro: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void getAvailableFilters(Promise promise) {
        try {
            Log.d(TAG, "Obtendo filtros disponíveis");
            
            // Esta é uma versão simulada
            WritableArray filters = Arguments.createArray();
            filters.pushString("normal");
            filters.pushString("grayscale");
            filters.pushString("sepia");
            filters.pushString("inverted");
            filters.pushString("vignette");
            filters.pushString("blur");
            
            promise.resolve(filters);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao obter filtros disponíveis", e);
            promise.reject("FILTER_ERROR", "Falha ao obter filtros disponíveis: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void getSupportedShaderFeatures(Promise promise) {
        try {
            Log.d(TAG, "Obtendo recursos de shader suportados");
            
            // Esta é uma versão simulada
            WritableArray features = Arguments.createArray();
            features.pushString("basic");
            features.pushString("transform");
            features.pushString("blur");
            features.pushString("noise");
            features.pushString("color");
            
            promise.resolve(features);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao obter recursos de shader suportados", e);
            promise.reject("SHADER_ERROR", "Falha ao obter recursos de shader suportados: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void setShaderUniforms(ReadableMap uniformValues, Promise promise) {
        try {
            Log.d(TAG, "Definindo uniformes de shader");
            
            // Aqui implementaríamos a lógica de shader uniforms
            // Esta é uma versão simulada
            
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao definir uniformes de shader", e);
            promise.reject("SHADER_ERROR", "Falha ao definir uniformes de shader: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void setResolution(int width, int height, Promise promise) {
        try {
            Log.d(TAG, "Definindo resolução para " + width + "x" + height);
            
            if (camera != null) {
                Camera.Parameters parameters = camera.getParameters();
                
                // Encontrar o tamanho suportado mais próximo
                Camera.Size bestSize = null;
                int minDiff = Integer.MAX_VALUE;
                
                for (Camera.Size size : parameters.getSupportedPictureSizes()) {
                    int diff = Math.abs(size.width - width) + Math.abs(size.height - height);
                    if (diff < minDiff) {
                        bestSize = size;
                        minDiff = diff;
                    }
                }
                
                if (bestSize != null) {
                    parameters.setPictureSize(bestSize.width, bestSize.height);
                    camera.setParameters(parameters);
                    
                    Log.d(TAG, "Resolução definida para " + bestSize.width + "x" + bestSize.height);
                }
            }
            
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao definir resolução", e);
            promise.reject("RESOLUTION_ERROR", "Falha ao definir resolução: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void setFrameRate(int fps, Promise promise) {
        try {
            Log.d(TAG, "Definindo taxa de quadros para " + fps + "fps");
            
            // Em uma implementação real, definiríamos a taxa de frames para vídeo
            
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao definir taxa de quadros", e);
            promise.reject("FRAMERATE_ERROR", "Falha ao definir taxa de quadros: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void supportsDynamicShaders(Promise promise) {
        try {
            // Esta é uma versão simulada
            // Em um dispositivo real, verificaríamos o suporte a OpenGL ES 3.0+
            
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao verificar suporte a shaders dinâmicos", e);
            promise.reject("SHADER_ERROR", "Falha ao verificar suporte a shaders: " + e.getMessage(), e);
        }
    }

    // Métodos auxiliares
    private boolean hasRequiredPermissions() {
        ReactApplicationContext context = getReactApplicationContext();
        
        boolean hasCamera = ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) 
                == PackageManager.PERMISSION_GRANTED;
                
        boolean hasAudio = ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) 
                == PackageManager.PERMISSION_GRANTED;
                
        boolean hasStorage = true;
        
        // Verificar armazenamento apenas para Android < 10
        if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.Q) {
            hasStorage = ContextCompat.checkSelfPermission(context, Manifest.permission.WRITE_EXTERNAL_STORAGE) 
                    == PackageManager.PERMISSION_GRANTED;
        }
        
        return hasCamera && hasAudio && hasStorage;
    }

    private void openCamera() {
        try {
            releaseCamera();
            
            camera = Camera.open(cameraId);
            
            if (camera != null) {
                Camera.Parameters parameters = camera.getParameters();
                
                // Configurar modo de flash
                parameters.setFlashMode(
                        "on".equals(flashMode) ? Camera.Parameters.FLASH_MODE_ON :
                        "auto".equals(flashMode) ? Camera.Parameters.FLASH_MODE_AUTO :
                        Camera.Parameters.FLASH_MODE_OFF
                );
                
                // Configurar orientação
                camera.setDisplayOrientation(90);  // Rotação retrato
                
                // Se tivermos um SurfaceHolder, configurar preview
                if (surfaceHolder != null) {
                    try {
                        camera.setPreviewDisplay(surfaceHolder);
                        camera.startPreview();
                    } catch (IOException e) {
                        Log.e(TAG, "Erro ao configurar preview", e);
                    }
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Erro ao abrir câmera", e);
        }
    }

    private void releaseCamera() {
        if (camera != null) {
            camera.stopPreview();
            camera.release();
            camera = null;
        }
    }

    private void releaseMediaRecorder() {
        if (mediaRecorder != null) {
            mediaRecorder.reset();   // Limpar configurações
            mediaRecorder.release(); // Liberar objeto
            mediaRecorder = null;
            
            // Importante: libere a câmera para ser usada por outras aplicações
            if (camera != null) {
                camera.lock();  // Travar a câmera para uso futuro
            }
        }
    }

    private File createImageFile() throws IOException {
        // Criar nome de arquivo único baseado na data/hora
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date());
        String imageFileName = "IMG_" + timeStamp + "_";
        
        File storageDir = mediaStorageDir;
        return File.createTempFile(
                imageFileName,  // prefixo
                ".jpg",         // sufixo
                storageDir      // diretório
        );
    }

    private File createVideoFile() throws IOException {
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date());
        String videoFileName = "VID_" + timeStamp + "_";
        
        File storageDir = mediaStorageDir;
        return File.createTempFile(
                videoFileName,
                ".mp4",
                storageDir
        );
    }

    // Implementação de SurfaceHolder.Callback
    @Override
    public void surfaceCreated(SurfaceHolder holder) {
        surfaceHolder = holder;
        
        // Abrir a câmera quando a superfície é criada
        if (isActive && camera == null) {
            openCamera();
        }
    }

    @Override
    public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
        surfaceHolder = holder;
        
        // Reiniciar o preview quando a superfície é alterada
        if (camera != null) {
            try {
                camera.stopPreview();
                camera.setPreviewDisplay(holder);
                camera.startPreview();
            } catch (IOException e) {
                Log.e(TAG, "Erro ao configurar preview", e);
            }
        }
    }

    @Override
    public void surfaceDestroyed(SurfaceHolder holder) {
        // Liberar recursos quando a superfície é destruída
        releaseCamera();
        surfaceHolder = null;
    }
} 