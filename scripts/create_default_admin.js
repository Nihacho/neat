/**
 * Script para crear un usuario administrador por defecto en la base de datos
 * 
 * Credenciales:
 * - Correo: Admin123@univalle.edu
 * - Contraseña: admin123
 * - Nivel: 1 (Administrador)
 * 
 * Uso: node scripts/create_default_admin.js
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://sxqfiokceqqbfhlrfmcz.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
    console.error('❌ Error: VITE_SUPABASE_ANON_KEY no está configurada en el archivo .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createDefaultAdmin() {
    console.log('🔧 Creando usuario administrador por defecto...\n');

    const adminData = {
        carnet: 'ADMIN001',
        nombre: 'Administrador del Sistema',
        telefono: '00000000',
        correo: 'Admin123@univalle.edu',
        tipo_persona: 'funcionario',
        cargo: 'Administrador del Sistema',
        area_trabajo: 'TI - Sistemas',
        nivel_permiso: 1,
        password: 'admin123'
    };

    try {
        // 1. Insertar o actualizar en la tabla persona
        console.log('📝 Insertando persona...');
        const { data: personaData, error: personaError } = await supabase
            .from('persona')
            .upsert({
                carnet: adminData.carnet,
                nombre: adminData.nombre,
                telefono: adminData.telefono,
                correo: adminData.correo,
                tipo_persona: adminData.tipo_persona
            }, { onConflict: 'carnet' })
            .select()
            .single();

        if (personaError) {
            console.error('❌ Error al insertar persona:', personaError);
            throw personaError;
        }

        console.log('✅ Persona creada/actualizada');

        // 2. Hashear la contraseña
        console.log('🔐 Hasheando contraseña...');
        const password_hash = await bcrypt.hash(adminData.password, 10);
        console.log('✅ Contraseña hasheada');

        // 3. Eliminar registro anterior de funcionario si existe
        console.log('🗑️  Limpiando registros anteriores...');
        await supabase
            .from('funcionario')
            .delete()
            .eq('carnet', adminData.carnet);

        // 4. Insertar en la tabla funcionario
        console.log('📝 Insertando funcionario...');
        const { data: funcionarioData, error: funcionarioError } = await supabase
            .from('funcionario')
            .insert({
                carnet: adminData.carnet,
                cargo: adminData.cargo,
                area_trabajo: adminData.area_trabajo,
                nivel_permiso: adminData.nivel_permiso,
                password_hash: password_hash
            })
            .select()
            .single();

        if (funcionarioError) {
            console.error('❌ Error al insertar funcionario:', funcionarioError);
            throw funcionarioError;
        }

        console.log('✅ Funcionario creado/actualizado\n');

        // Mostrar resumen
        console.log('═══════════════════════════════════════════════');
        console.log('✅ USUARIO ADMINISTRADOR CREADO EXITOSAMENTE');
        console.log('═══════════════════════════════════════════════');
        console.log('📧 Correo:      Admin123@univalle.edu');
        console.log('🔑 Contraseña:  admin123');
        console.log('👤 Nombre:      Administrador del Sistema');
        console.log('🎯 Nivel:       1 (Administrador - Acceso Completo)');
        console.log('═══════════════════════════════════════════════\n');
        console.log('🎉 Ahora puedes iniciar sesión con estas credenciales');
        console.log('🌐 URL: http://localhost:5174/login\n');

    } catch (error) {
        console.error('\n❌ Error al crear usuario administrador:', error.message);
        process.exit(1);
    }
}

// Ejecutar el script
createDefaultAdmin();
