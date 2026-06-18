#!/usr/bin/env python3
# ────────────────────────────────────────────
# MemoLife Quick Start Helper
# Run this to check system & show next steps
# ────────────────────────────────────────────

import os
import subprocess
import platform
import sys

def run_cmd(cmd):
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=5)
        return result.returncode == 0, result.stdout.strip()
    except Exception as e:
        return False, str(e)

def check_system():
    print("\n" + "="*60)
    print("🔍 MemoLife System Check")
    print("="*60 + "\n")
    
    checks = {}
    
    # Python
    print("Checking Python...")
    success, version = run_cmd("python3 --version")
    checks["Python 3.12+"] = success
    if success:
        print(f"  ✅ {version}")
    else:
        print(f"  ❌ Python not found or wrong version")
    
    # Node.js
    print("Checking Node.js...")
    success, version = run_cmd("node --version")
    checks["Node.js 18+"] = success
    if success:
        print(f"  ✅ {version}")
    else:
        print(f"  ❌ Node.js not found")
    
    # Docker
    print("Checking Docker...")
    success, _ = run_cmd("docker --version")
    checks["Docker"] = success
    if success:
        print(f"  ✅ Docker available")
    else:
        print(f"  ⚠️  Docker not found (optional for dev)")
    
    # Backend running
    print("Checking Backend...")
    success, _ = run_cmd("curl -s http://127.0.0.1:8000/health")
    checks["Backend Running"] = success
    if success:
        print(f"  ✅ Backend running on port 8000")
    else:
        print(f"  ❌ Backend not running")
    
    # Git
    print("Checking Git...")
    success, _ = run_cmd("git --version")
    checks["Git"] = success
    if success:
        print(f"  ✅ Git available")
    else:
        print(f"  ❌ Git not found")
    
    return checks

def show_quick_start():
    print("\n" + "="*60)
    print("🚀 Quick Start Guide")
    print("="*60 + "\n")
    
    print("📱 TO TEST ON YOUR SMARTPHONE:")
    print("-" * 60)
    print("1. Make sure backend is running:")
    print("   cd backend")
    print("   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000")
    print()
    print("2. In another terminal, start Expo:")
    print("   chmod +x ./test-smartphone.sh")
    print("   ./test-smartphone.sh")
    print()
    print("3. Scan QR code with Expo Go app on your phone")
    print()
    
    print("🐳 TO TEST WITH DOCKER:")
    print("-" * 60)
    print("1. From project root:")
    print("   docker-compose up -d")
    print()
    print("2. Check status:")
    print("   docker-compose ps")
    print()
    print("3. View API docs:")
    print("   http://localhost:8000/docs")
    print()
    
    print("🔧 TO DEPLOY TO PRODUCTION:")
    print("-" * 60)
    print("See: DEPLOYMENT.md")
    print()
    
    print("📚 FOR COMPLETE DOCUMENTATION:")
    print("-" * 60)
    print("See: README_COMPLET.md")
    print()

def main():
    print("\n🧠 MemoLife - AI Personal Assistant")
    print("Quick Start Helper\n")
    
    # Check system
    checks = check_system()
    
    # Summary
    print("\n" + "="*60)
    print("📊 Status Summary")
    print("="*60)
    
    for check, status in checks.items():
        symbol = "✅" if status else "❌"
        print(f"{symbol} {check}")
    
    # Show next steps
    show_quick_start()
    
    print("="*60)
    print("✨ You're all set! Follow the steps above to get started.")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
