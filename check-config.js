#!/usr/bin/env node

/**
 * Script para verificar la configuración de Firebase
 * Ejecuta: node check-config.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Verificando configuración de Firebase...\n');

let hasErrors = false;

// ========================================
// 1. Verificar archivo .env
// ========================================
console.log('📄 Verificando .env...');
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
    console.error('  ❌ Archivo .env no encontrado');
    hasErrors = true;
} else {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Verificar si tiene credenciales configuradas
    const hasAdminPath = envContent.includes('FIREBASE_ADMIN_SDK_PATH=') && 
                        !envContent.includes('FIREBASE_ADMIN_SDK_PATH=./serviceAccountKey.json') &&
                        !envContent.includes('#FIREBASE_ADMIN_SDK_PATH');
    
    const hasProjectId = envContent.includes('FIREBASE_PROJECT_ID=') && 
                        !envContent.includes('FIREBASE_PROJECT_ID=tu-proyecto-id') &&
                        !envContent.includes('#FIREBASE_PROJECT_ID');
    
    if (!hasAdminPath && !hasProjectId) {
        console.error('  ❌ No hay credenciales de Firebase configuradas en .env');
        console.error('     Configura FIREBASE_ADMIN_SDK_PATH o las variables individuales');
        hasErrors = true;
    } else {
        console.log('  ✅ Archivo .env existe y tiene credenciales configuradas');
        
        // Si usa archivo JSON, verificar que existe
        if (hasAdminPath) {
            const match = envContent.match(/FIREBASE_ADMIN_SDK_PATH=(.+)/);
            if (match) {
                const jsonPath = match[1].trim();
                const fullPath = path.join(__dirname, jsonPath);
                if (!fs.existsSync(fullPath)) {
                    console.error(`  ❌ Archivo de credenciales no encontrado: ${jsonPath}`);
                    hasErrors = true;
                } else {
                    console.log(`  ✅ Archivo de credenciales encontrado: ${jsonPath}`);
                }
            }
        }
    }
}

// ========================================
// 2. Verificar firebase-config.js
// ========================================
console.log('\n📄 Verificando public/firebase-config.js...');
const configPath = path.join(__dirname, 'public', 'firebase-config.js');

if (!fs.existsSync(configPath)) {
    console.error('  ❌ Archivo firebase-config.js no encontrado');
    hasErrors = true;
} else {
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    if (configContent.includes('TU_API_KEY')) {
        console.error('  ❌ firebase-config.js tiene valores placeholder (TU_API_KEY)');
        console.error('     Necesitas reemplazarlos con tus credenciales reales de Firebase');
        hasErrors = true;
    } else {
        console.log('  ✅ firebase-config.js configurado');
    }
    
    if (configContent.includes('TU_VAPID_KEY')) {
        console.error('  ❌ VAPID_KEY no configurado en firebase-config.js');
        hasErrors = true;
    } else {
        console.log('  ✅ VAPID_KEY configurado');
    }
}

// ========================================
// 3. Verificar firebase-config-sw.js
// ========================================
console.log('\n📄 Verificando public/firebase-config-sw.js...');
const configSwPath = path.join(__dirname, 'public', 'firebase-config-sw.js');

if (!fs.existsSync(configSwPath)) {
    console.error('  ❌ Archivo firebase-config-sw.js no encontrado');
    hasErrors = true;
} else {
    const configSwContent = fs.readFileSync(configSwPath, 'utf8');
    
    if (configSwContent.includes('TU_API_KEY')) {
        console.error('  ❌ firebase-config-sw.js tiene valores placeholder');
        hasErrors = true;
    } else {
        console.log('  ✅ firebase-config-sw.js configurado');
    }
}

// ========================================
// 4. Verificar node_modules
// ========================================
console.log('\n📦 Verificando dependencias...');
const nodeModulesPath = path.join(__dirname, 'node_modules');

if (!fs.existsSync(nodeModulesPath)) {
    console.error('  ❌ node_modules no encontrado');
    console.error('     Ejecuta: npm install');
    hasErrors = true;
} else {
    console.log('  ✅ Dependencias instaladas');
}

// ========================================
// Resultado final
// ========================================
console.log('\n' + '='.repeat(50));

if (hasErrors) {
    console.error('\n❌ CONFIGURACIÓN INCOMPLETA\n');
    console.log('📖 Lee el archivo CONFIGURACION.md para instrucciones detalladas\n');
    process.exit(1);
} else {
    console.log('\n✅ CONFIGURACIÓN COMPLETA\n');
    console.log('🚀 Puedes iniciar el servidor con: node server/index.js\n');
    process.exit(0);
}
