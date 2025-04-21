package com.circle.camera;

import android.Manifest;
import android.content.pm.PackageManager;
import android.hardware.Camera;
import android.media.MediaRecorder;
import android.util.Log;
import android.view.SurfaceHolder;
import android.view.SurfaceView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@SuppressWarnings("deprecation")
public class CircleCameraModule extends ReactContextBaseJavaModule {
    private static final String TAG = "CircleCameraModule";
    private static final String MODULE_NAME = "CircleCamera";

    // Constantes
    private static final int PERMISSION_REQUEST_CAMERA = 1001;
    
    // Estados
    private boolean isInitialized = false;
    
    // Construtor
    public CircleCameraModule(ReactApplicationContext reactContext) {
        super(reactContext);
        Log.d(TAG, "Módulo de câmera simplificado inicializado");
    }

    @NonNull
    @Override
    public String getName() {
        return MODULE_NAME;
    }

    // Método simplificado para verificar permissões
    @ReactMethod
    public void checkPermissions(Promise promise) {
        try {
            ReactApplicationContext context = getReactApplicationContext();
            
            boolean hasCamera = ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) 
                    == PackageManager.PERMISSION_GRANTED;
            
            WritableMap result = Arguments.createMap();
            result.putBoolean("hasPermission", hasCamera);
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao verificar permissões de câmera", e);
            promise.reject("PERMISSION_ERROR", "Falha ao verificar permissões: " + e.getMessage(), e);
        }
    }

    // Método simplificado para inicializar
    @ReactMethod
    public void initialize(Promise promise) {
        try {
            Log.d(TAG, "Inicializando módulo de câmera simplificado");
            
            // Verificar permissões
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

    // Verifica se temos permissão de câmera
    private boolean hasRequiredPermissions() {
        ReactApplicationContext context = getReactApplicationContext();
        return ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) 
                == PackageManager.PERMISSION_GRANTED;
    }

    // Provê constantes para o módulo JavaScript
    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("isAvailable", true);
        return constants;
    }

    /**
     * Verifica se o dispositivo suporta shaders dinâmicos.
     * Esta é uma função simplificada que retorna sempre false para compatibilidade.
     */
    @ReactMethod
    public void supportsDynamicShaders(Promise promise) {
        try {
            Log.d(TAG, "Verificando suporte a shaders dinâmicos");
            // Nesta implementação básica, retornamos false
            // Para suportar shaders dinâmicos, seria necessário verificar recursos OpenGL
            promise.resolve(false);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao verificar suporte a shaders dinâmicos", e);
            promise.reject("SHADER_ERROR", "Falha ao verificar suporte a shaders: " + e.getMessage(), e);
        }
    }
    
    /**
     * Retorna a lista de filtros disponíveis.
     * Função simplificada que retorna apenas os filtros básicos para compatibilidade.
     */
    @ReactMethod
    public void getAvailableFilters(Promise promise) {
        try {
            Log.d(TAG, "Obtendo filtros disponíveis");
            // Criar um array com os filtros básicos suportados
            WritableArray filters = Arguments.createArray();
            filters.pushString("normal");
            filters.pushString("grayscale");
            filters.pushString("sepia");
            
            promise.resolve(filters);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao obter filtros disponíveis", e);
            promise.reject("FILTER_ERROR", "Falha ao obter filtros disponíveis: " + e.getMessage(), e);
        }
    }

    /**
     * Define o modo de flash da câmera.
     * 
     * @param flashMode O modo de flash ("on", "off", "auto", "torch")
     * @param promise Promise para retornar resultado ou erro
     */
    @ReactMethod
    public void setFlashMode(String flashMode, Promise promise) {
        try {
            Log.d(TAG, "Definindo modo de flash para: " + flashMode);
            
            // Esta é uma implementação a nível de módulo
            // A implementação real é feita no CircleCameraView
            // quando a propriedade é definida via React Native
            
            // Quando o círculo de câmera no React Native é atualizado com um modo de flash,
            // o CameraViewManager fará a chamada para CircleCameraView.setFlashMode
            
            // Este método existe para permitir chamadas diretas ao módulo
            // por exemplo, durante testes ou quando a câmera não está sendo exibida
            
            WritableMap result = Arguments.createMap();
            result.putString("flashMode", flashMode);
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao definir modo de flash: " + e.getMessage(), e);
            promise.reject("FLASH_ERROR", "Falha ao definir modo de flash: " + e.getMessage(), e);
        }
    }

    /**
     * Inicia a câmera (se não estiver sendo mostrada em uma View).
     * Este método é principalmente para uso durante testes.
     * 
     * @param promise Promise para retornar resultado ou erro
     */
    @ReactMethod
    public void startCamera(Promise promise) {
        try {
            Log.d(TAG, "Inicializando câmera via módulo");
            
            // Este método é principalmente para testes ou situações especiais
            // A implementação real é normalmente feita via CircleCameraView
            
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao iniciar câmera: " + e.getMessage(), e);
            promise.reject("CAMERA_ERROR", "Falha ao iniciar câmera: " + e.getMessage(), e);
        }
    }
    
    /**
     * Para a câmera (se não estiver sendo mostrada em uma View).
     * Este método é principalmente para uso durante testes.
     * 
     * @param promise Promise para retornar resultado ou erro
     */
    @ReactMethod
    public void stopCamera(Promise promise) {
        try {
            Log.d(TAG, "Parando câmera via módulo");
            
            // Este método é principalmente para testes ou situações especiais
            // A implementação real é normalmente feita via CircleCameraView
            
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao parar câmera: " + e.getMessage(), e);
            promise.reject("CAMERA_ERROR", "Falha ao parar câmera: " + e.getMessage(), e);
        }
    }
    
    /**
     * Alterna o flash da câmera entre os modos disponíveis.
     * 
     * @param promise Promise para retornar resultado ou erro
     */
    @ReactMethod
    public void toggleFlash(Promise promise) {
        try {
            Log.d(TAG, "Alternando flash da câmera via módulo");
            
            // Este método é principalmente para uso direto do JS
            // A implementação real geralmente é feita no JS que chama setFlashMode
            
            WritableMap result = Arguments.createMap();
            result.putString("status", "success");
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao alternar flash: " + e.getMessage(), e);
            promise.reject("FLASH_ERROR", "Falha ao alternar flash: " + e.getMessage(), e);
        }
    }
    
    /**
     * Alterna entre câmera frontal e traseira.
     * 
     * @param promise Promise para retornar resultado ou erro
     */
    @ReactMethod
    public void switchCamera(Promise promise) {
        try {
            Log.d(TAG, "Alternando entre câmeras via módulo");
            
            // Este método é principalmente para testes ou situações especiais
            // A implementação real é normalmente feita via CircleCameraView
            
            WritableMap result = Arguments.createMap();
            result.putString("status", "success");
            
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao alternar câmera: " + e.getMessage(), e);
            promise.reject("CAMERA_ERROR", "Falha ao alternar câmera: " + e.getMessage(), e);
        }
    }
} 