package com.circle.camera;

import android.os.Handler;
import android.os.Looper;

/**
 * Classe utilitária para executar código na thread de UI do Android
 */
public class Post {
    
    /**
     * Executa um Runnable na thread de UI
     * 
     * @param runnable O código a ser executado
     */
    public static void runOnUI(Runnable runnable) {
        // Verificar se já estamos na thread de UI
        if (Looper.myLooper() == Looper.getMainLooper()) {
            // Se já estamos na thread de UI, execute imediatamente
            runnable.run();
        } else {
            // Caso contrário, poste para o Handler da thread principal
            new Handler(Looper.getMainLooper()).post(runnable);
        }
    }
    
    /**
     * Executa um Runnable na thread de UI com atraso
     * 
     * @param runnable O código a ser executado
     * @param delayMillis Atraso em milissegundos
     */
    public static void runOnUIDelayed(Runnable runnable, long delayMillis) {
        new Handler(Looper.getMainLooper()).postDelayed(runnable, delayMillis);
    }
} 