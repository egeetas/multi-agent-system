import os
import json
import urllib.request
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from agents import run_multi_agent_workflow

app = FastAPI(title="Multi-Agent System Live Demo")

# Create static directory if it doesn't exist
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
async def get_index():
    return FileResponse(os.path.join(static_dir, "index.html"))

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Desteklenen belgeleri okur ve içerisindeki metni çıkarır."""
    filename = file.filename
    content = await file.read()
    
    ext = os.path.splitext(filename)[1].lower()
    text = ""
    
    if ext == ".pdf":
        import io
        import pypdf
        try:
            pdf_reader = pypdf.PdfReader(io.BytesIO(content))
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        except Exception as e:
            return JSONResponse(status_code=400, content={"status": "error", "message": f"PDF okunamadı: {str(e)}"})
    elif ext in [".txt", ".md", ".json", ".csv"]:
        try:
            text = content.decode("utf-8")
        except UnicodeDecodeError:
            try:
                text = content.decode("iso-8859-9") # Türkçe karakter desteği
            except:
                return JSONResponse(status_code=400, content={"status": "error", "message": "Dosya kodlaması çözülemedi (UTF-8 veya ISO-8859-9 olmalı)."})
    else:
        return JSONResponse(status_code=400, content={"status": "error", "message": "Yalnızca .pdf, .txt, .md, .json, .csv dosyaları desteklenmektedir."})
        
    return {"status": "success", "text": text, "filename": filename}

@app.get("/api/models")
async def get_ollama_models():
    """Lokal Ollama'da yüklü olan modelleri listeler."""
    try:
        req = urllib.request.Request("http://localhost:11434/api/tags")
        with urllib.request.urlopen(req, timeout=3) as response:
            data = json.loads(response.read().decode('utf-8'))
            models = []
            for model in data.get("models", []):
                name = model.get("name", "")
                capabilities = model.get("capabilities", [])
                if "embed" in name.lower():
                    continue
                if capabilities and "completion" not in capabilities:
                    continue
                models.append(name)
            return {"status": "online", "models": models}
    except Exception:
        return {"status": "offline", "models": ["llama3", "mistral", "phi3", "gemma"]}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Kullanıcıdan gelen başlatma mesajını bekle
            data = await websocket.receive_text()
            config = json.loads(data)
            
            prompt = config.get("prompt", "")
            model_name = config.get("model", "llama3")
            workflow = config.get("workflow", "writing")
            file_content = config.get("file_content", "")
            
            if not prompt:
                await websocket.send_json({"event": "error", "message": "Boş bir prompt gönderilemez."})
                continue
                
            # Çoklu ajan akışını çalıştır ve adımları ilet
            try:
                import asyncio
                for step in run_multi_agent_workflow(prompt, model_name=model_name, workflow=workflow, file_content=file_content):
                    await websocket.send_json(step)
                    await asyncio.sleep(0.01)
            except Exception as e:
                await websocket.send_json({"event": "error", "message": f"Akış sırasında hata oluştu: {str(e)}"})
                
    except WebSocketDisconnect:
        print("WebSocket bağlantısı kesildi.")
    except Exception as e:
        print(f"WebSocket hatası: {e}")
        try:
            await websocket.close()
        except:
            pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
