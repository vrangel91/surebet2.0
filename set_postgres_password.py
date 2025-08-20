#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para alterar senha do usuário postgres no PostgreSQL
Execute como administrador se necessário
"""

import psycopg2
import sys
import os
from getpass import getpass

def test_connection(password):
    """Testa conexão com diferentes senhas"""
    try:
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            database="postgres",
            user="postgres",
            password=password
        )
        conn.close()
        return True
    except Exception as e:
        return False

def change_password(old_password, new_password):
    """Altera a senha do usuário postgres"""
    try:
        # Conectar com a senha antiga
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            database="postgres",
            user="postgres",
            password=old_password
        )
        
        cursor = conn.cursor()
        
        # Alterar senha
        cursor.execute(f"ALTER USER postgres PASSWORD '{new_password}'")
        conn.commit()
        
        cursor.close()
        conn.close()
        
        print(f"✅ Senha alterada com sucesso para: {new_password}")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao alterar senha: {e}")
        return False

def main():
    print("🔐 Script para alterar senha do PostgreSQL")
    print("=" * 50)
    
    # Nova senha definida
    NEW_PASSWORD = "SureStake2024!"
    print(f"🎯 Nova senha a ser definida: {NEW_PASSWORD}")
    print()
    
    # Lista de senhas comuns para testar
    common_passwords = [
        "",           # Sem senha
        "postgres",   # Senha padrão comum
        "admin",      # Admin
        "password",   # Password
        "123456",     # 123456
        "postgresql", # PostgreSQL
        "root",       # Root
        "user"        # User
    ]
    
    print("🔍 Testando conexões com senhas comuns...")
    
    working_password = None
    
    for password in common_passwords:
        display_password = "''" if password == "" else password
        print(f"   Testando: {display_password}")
        
        if test_connection(password):
            print(f"   ✅ Conexão bem-sucedida com: {display_password}")
            working_password = password
            break
        else:
            print(f"   ❌ Falhou com: {display_password}")
    
    print()
    
    if working_password is not None:
        print(f"🎉 Senha funcional encontrada: {working_password if working_password else 'sem senha'}")
        print("🔄 Alterando para nova senha...")
        
        if change_password(working_password, NEW_PASSWORD):
            print()
            print("🎯 CONFIGURAÇÃO FINAL:")
            print(f"   Host: localhost")
            print(f"   Porta: 5432")
            print(f"   Usuário: postgres")
            print(f"   Senha: {NEW_PASSWORD}")
            print(f"   Banco: surestake_db")
            print()
            print("✅ Agora você pode:")
            print("   1. Criar o banco: npm run init-db")
            print("   2. Iniciar servidor: npm run dev")
        else:
            print("❌ Falha ao alterar senha")
            sys.exit(1)
    else:
        print("❌ Nenhuma senha funcionou!")
        print()
        print("🔧 SOLUÇÕES ALTERNATIVAS:")
        print("   1. Execute este script como ADMINISTRADOR")
        print("   2. Verifique se o PostgreSQL está rodando")
        print("   3. Tente reiniciar o serviço PostgreSQL")
        print("   4. Verifique o arquivo pg_hba.conf")
        sys.exit(1)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⏹️ Script interrompido pelo usuário")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}")
        sys.exit(1)
