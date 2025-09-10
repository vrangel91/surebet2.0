#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para modificar temporariamente a autenticação do PostgreSQL
e permitir conexão sem senha para alterar a senha
"""

import os
import shutil
import time
import subprocess
import sys

def backup_pg_hba():
    """Faz backup do arquivo pg_hba.conf"""
    pg_hba_path = r"C:\Program Files\PostgreSQL\16\data\pg_hba.conf"
    backup_path = r"C:\Program Files\PostgreSQL\16\data\pg_hba.conf.backup"
    
    try:
        if os.path.exists(pg_hba_path):
            shutil.copy2(pg_hba_path, backup_path)
            print(f"✅ Backup criado: {backup_path}")
            return True
        else:
            print(f"❌ Arquivo não encontrado: {pg_hba_path}")
            return False
    except Exception as e:
        print(f"❌ Erro ao criar backup: {e}")
        return False

def modify_pg_hba():
    """Modifica pg_hba.conf para permitir conexão sem senha"""
    pg_hba_path = r"C:\Program Files\PostgreSQL\16\data\pg_hba.conf"
    
    try:
        # Ler arquivo atual
        with open(pg_hba_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Modificar linhas de autenticação
        modified_lines = []
        for line in lines:
            if line.strip().startswith('local') and 'all' in line and 'all' in line:
                # Alterar para trust (sem senha)
                modified_lines.append('local   all             all                                     trust\n')
            elif line.strip().startswith('host') and 'all' in line and 'all' in line and '127.0.0.1' in line:
                # Alterar para trust (sem senha)
                modified_lines.append('host    all             all             127.0.0.1/32            trust\n')
            elif line.strip().startswith('host') and 'all' in line and 'all' in line and '::1' in line:
                # Alterar para trust (sem senha)
                modified_lines.append('host    all             all             ::1/128                 trust\n')
            else:
                modified_lines.append(line)
        
        # Escrever arquivo modificado
        with open(pg_hba_path, 'w', encoding='utf-8') as f:
            f.writelines(modified_lines)
        
        print("✅ pg_hba.conf modificado para permitir conexão sem senha")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao modificar pg_hba.conf: {e}")
        return False

def restart_postgres():
    """Reinicia o serviço PostgreSQL"""
    try:
        print("🔄 Reiniciando serviço PostgreSQL...")
        
        # Parar serviço
        subprocess.run(['net', 'stop', 'postgresql-x64-16'], capture_output=True)
        time.sleep(3)
        
        # Iniciar serviço
        subprocess.run(['net', 'start', 'postgresql-x64-16'], capture_output=True)
        time.sleep(5)
        
        print("✅ Serviço PostgreSQL reiniciado")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao reiniciar serviço: {e}")
        return False

def test_connection():
    """Testa conexão sem senha"""
    try:
        import psycopg2
        
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            database="postgres",
            user="postgres",
            password=""
        )
        conn.close()
        print("✅ Conexão bem-sucedida sem senha!")
        return True
        
    except Exception as e:
        print(f"❌ Falha na conexão: {e}")
        return False

def change_password():
    """Altera a senha do usuário postgres"""
    try:
        import psycopg2
        
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            database="postgres",
            user="postgres",
            password=""
        )
        
        cursor = conn.cursor()
        cursor.execute("ALTER USER postgres PASSWORD 'SureStake2024!'")
        conn.commit()
        
        cursor.close()
        conn.close()
        
        print("✅ Senha alterada para: SureStake2024!")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao alterar senha: {e}")
        return False

def restore_pg_hba():
    """Restaura o arquivo pg_hba.conf original"""
    pg_hba_path = r"C:\Program Files\PostgreSQL\16\data\pg_hba.conf"
    backup_path = r"C:\Program Files\PostgreSQL\16\data\pg_hba.conf.backup"
    
    try:
        if os.path.exists(backup_path):
            shutil.copy2(backup_path, pg_hba_path)
            print("✅ pg_hba.conf restaurado")
            return True
        else:
            print("❌ Arquivo de backup não encontrado")
            return False
    except Exception as e:
        print(f"❌ Erro ao restaurar: {e}")
        return False

def main():
    print("🔧 Script para corrigir autenticação do PostgreSQL")
    print("=" * 60)
    
    # Verificar se está rodando como administrador
    try:
        test_file = r"C:\Program Files\PostgreSQL\16\data\test_write.tmp"
        with open(test_file, 'w') as f:
            f.write("test")
        os.remove(test_file)
        print("✅ Privilégios de administrador confirmados")
    except:
        print("❌ ERRO: Execute este script como ADMINISTRADOR!")
        print("   Clique com botão direito no PowerShell e selecione 'Executar como administrador'")
        input("Pressione Enter para sair...")
        sys.exit(1)
    
    try:
        # 1. Fazer backup
        if not backup_pg_hba():
            return
        
        # 2. Modificar pg_hba.conf
        if not modify_pg_hba():
            return
        
        # 3. Reiniciar PostgreSQL
        if not restart_postgres():
            return
        
        # 4. Testar conexão
        if not test_connection():
            print("❌ Falha na conexão após modificação")
            return
        
        # 5. Alterar senha
        if not change_password():
            return
        
        # 6. Restaurar pg_hba.conf
        if not restore_pg_hba():
            return
        
        # 7. Reiniciar novamente
        restart_postgres()
        
        print("\n🎉 PROCESSO CONCLUÍDO COM SUCESSO!")
        print("=" * 40)
        print("🔑 Nova senha: SureStake2024!")
        print("📝 Configurações:")
        print("   Host: localhost")
        print("   Porta: 5432")
        print("   Usuário: postgres")
        print("   Senha: SureStake2024!")
        print("   Banco: surestake_db")
        print("\n✅ Agora você pode:")
        print("   1. Criar o banco: npm run init-db")
        print("   2. Iniciar servidor: npm run dev")
        
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}")
        print("🔄 Tentando restaurar configuração...")
        restore_pg_hba()
        restart_postgres()
    
    input("\nPressione Enter para sair...")

if __name__ == "__main__":
    main()
