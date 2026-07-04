import os
# Disable CrewAI telemetry and redirect all default OpenAI API routing locally to Ollama
os.environ["CREWAI_TELEMETRY_OPT_OUT"] = "true"
os.environ["OTEL_SDK_DISABLED"] = "true"
os.environ["OPENAI_API_KEY"] = "fake-key-for-local-ollama"
os.environ["OPENAI_API_BASE"] = "http://localhost:11434/v1"

import time
import json
import queue
import threading
from crewai import Agent, Task, Crew, Process, LLM

# --- GERÇEK CREWAI WORKFLOW ---

def make_step_callback(agent_name, event_queue):
    """CrewAI ajanlarının adım adımlarını yakalayıp WebSocket kuyruğuna ekler."""
    def callback(step_outcome):
        thought_text = ""
        if hasattr(step_outcome, 'thought'):
            thought_text = step_outcome.thought
        elif isinstance(step_outcome, list) and len(step_outcome) > 0:
            thought_text = str(step_outcome[0])
        else:
            thought_text = str(step_outcome)
            
        if len(thought_text) > 300:
            thought_text = thought_text[:300] + "..."
            
        event_queue.put({
            "event": "thought_stream", 
            "agent": agent_name, 
            "chunk": f"\n[Düşünce Adımı]: {thought_text}\n"
        })
    return callback

def run_crewai_thread(prompt, model_name, workflow, file_content, event_queue):
    """CrewAI akışını arka planda çalıştıran thread fonksiyonu."""
    try:
        # LLM Yapılandırması (Ollama)
        local_llm = LLM(
            model=f"ollama/{model_name}",
            base_url="http://localhost:11434",
            timeout=120
        )
        
        # Dosya içeriğinin boş olup olmadığını denetle
        file_ctx = file_content if file_content.strip() else "Herhangi bir harici dosya yüklenmedi."
        
        # 1. Ajanların ve Görevlerin Dinamik Yapılandırılması
        if workflow == "coding":
            # Yazılım Geliştirme Akışı
            planner_agent = Agent(
                role="Yazılımcı Ajan (Coder)",
                goal="Kullanıcının istediği yazılım kodunu yaz ve algoritmayı tasarla.",
                backstory="Sen yetenekli bir yazılımcısın. Verilen yönergeler doğrultusunda temiz, optimize ve yapılandırılmış kodlar yazarsın.",
                llm=local_llm,
                verbose=True,
                step_callback=make_step_callback("planner", event_queue)
            )
            
            researcher_agent = Agent(
                role="Denetçi Ajan (Reviewer)",
                goal="Yazılımcının kodunu incele, performans ve güvenlik açıklarını analiz et ve iyileştirme tavsiyeleri ver.",
                backstory="Sen kıdemli bir kod denetçisisin. Yazılan kodlardaki performans darboğazlarını, hata risklerini ve temiz kod standartlarını analiz edersin.",
                llm=local_llm,
                verbose=True,
                step_callback=make_step_callback("researcher", event_queue)
            )
            
            writer_agent = Agent(
                role="Testçi Ajan (Tester)",
                goal="Yazılan kodu ve denetçi raporunu incele, birim testleri (unit tests) yaz ve nihai yazılım belgesini oluştur.",
                backstory="Sen kalite kontrol (QA) uzmanısın. Yazılan kodların hatasız çalışması için test senaryoları ve test kodları geliştirirsin.",
                llm=local_llm,
                verbose=True,
                step_callback=make_step_callback("writer", event_queue)
            )
            
            # Task Callbacks
            def code_callback(task_output):
                output_str = getattr(task_output, 'raw', str(task_output))
                event_queue.put({"event": "complete", "agent": "planner", "output": output_str})
                event_queue.put({"event": "send_data", "from": "planner", "to": "researcher", "data": "Kaynak Kod ve Algoritma"})
                event_queue.put({"event": "start", "agent": "researcher"})
                event_queue.put({"event": "thought", "agent": "researcher", "content": "Kod blokları denetleniyor..."})

            def review_callback(task_output):
                output_str = getattr(task_output, 'raw', str(task_output))
                event_queue.put({"event": "complete", "agent": "researcher", "output": output_str})
                event_queue.put({"event": "send_data", "from": "researcher", "to": "writer", "data": "Kod İnceleme Raporu"})
                event_queue.put({"event": "start", "agent": "writer"})
                event_queue.put({"event": "thought", "agent": "writer", "content": "Birim testleri (Unit Tests) yazılıyor..."})

            def test_callback(task_output):
                output_str = getattr(task_output, 'raw', str(task_output))
                event_queue.put({"event": "complete", "agent": "writer", "output": output_str})
                event_queue.put({"event": "final_output", "output": output_str})

            # Görevler
            plan_task = Task(
                description="Şu isterlere uygun bir yazılım kodu yaz: {prompt}. Ek olarak varsa şu dosya içeriğini referans al: {file_content}",
                expected_output="Yazılan kaynak kod blokları ve açıklamaları.",
                agent=planner_agent,
                callback=code_callback
            )
            
            research_task = Task(
                description="Yazılımcı ajanın hazırladığı kodu incele. Varsa şu dosya içeriğini referans al: {file_content}. Kodun performans, güvenlik ve okunabilirlik analizini yap.",
                expected_output="Kod denetim raporu ve kodun düzeltilmiş/iyileştirilmiş versiyonu.",
                agent=researcher_agent,
                context=[plan_task],
                callback=review_callback
            )
            
            write_task = Task(
                description="Yazılan kodu ve denetim raporunu al. Bu kod için pytest/unittest formatında birim testleri (unit tests) yaz. Sonuç olarak hem optimize edilmiş ana kodu hem de test kodlarını içeren temiz bir Markdown raporu oluştur. Varsa şu dosya içeriğini de göz önünde bulundur: {file_content}",
                expected_output="Ana kod ve birim testlerini içeren nihai yazılım belgesi (Markdown formatında).",
                agent=writer_agent,
                context=[research_task],
                callback=test_callback
            )

        elif workflow == "business":
            # İş Stratejisi Akışı
            planner_agent = Agent(
                role="Pazar Analisti (Analyst)",
                goal="İstenen iş fikri veya sektörü analiz et, pazar büyüklüğünü ve trendleri derle.",
                backstory="Sen deneyimli bir pazar analistisin. Sektörleri, trendleri ve pazarın durumunu verilerle analiz edersin.",
                llm=local_llm,
                verbose=True,
                step_callback=make_step_callback("planner", event_queue)
            )
            
            researcher_agent = Agent(
                role="Stratejist Ajan (Strategist)",
                goal="Analistin raporunu incele, iş fikrinin güçlü ve zayıf yönlerini bulup bir SWOT tablosu oluştur.",
                backstory="Sen stratejik yönetim uzmanısın. İş fikirlerinin SWOT (Güçlü/Zayıf/Fırsat/Tehdit) analizlerini çıkarır ve strateji geliştirirsin.",
                llm=local_llm,
                verbose=True,
                step_callback=make_step_callback("researcher", event_queue)
            )
            
            writer_agent = Agent(
                role="İş Danışmanı (Consultant)",
                goal="Analist ve stratejistten gelen verileri alarak, işin büyümesi için yol haritası içeren bir iş planı hazırla.",
                backstory="Sen profesyonel bir iş geliştirme danışmanısın. İş modellerini, gelir stratejilerini ve büyüme yol haritalarını hazırlarsın.",
                llm=local_llm,
                verbose=True,
                step_callback=make_step_callback("writer", event_queue)
            )
            
            # Task Callbacks
            def analyze_callback(task_output):
                output_str = getattr(task_output, 'raw', str(task_output))
                event_queue.put({"event": "complete", "agent": "planner", "output": output_str})
                event_queue.put({"event": "send_data", "from": "planner", "to": "researcher", "data": "Pazar Analiz Raporu"})
                event_queue.put({"event": "start", "agent": "researcher"})
                event_queue.put({"event": "thought", "agent": "researcher", "content": "SWOT analizi matrisi oluşturuluyor..."})

            def strategize_callback(task_output):
                output_str = getattr(task_output, 'raw', str(task_output))
                event_queue.put({"event": "complete", "agent": "researcher", "output": output_str})
                event_queue.put({"event": "send_data", "from": "researcher", "to": "writer", "data": "SWOT Analiz Çıktıları"})
                event_queue.put({"event": "start", "agent": "writer"})
                event_queue.put({"event": "thought", "agent": "writer", "content": "Büyüme stratejisi ve iş planı yazılıyor..."})

            def consult_callback(task_output):
                output_str = getattr(task_output, 'raw', str(task_output))
                event_queue.put({"event": "complete", "agent": "writer", "output": output_str})
                event_queue.put({"event": "final_output", "output": output_str})

            # Görevler
            plan_task = Task(
                description="Şu iş fikri veya sektörü analiz et: {prompt}. Varsa şu dosya içeriğindeki verileri de pazar araştırmasına dahil et: {file_content}",
                expected_output="Sektörel trendler ve pazar analiz raporu.",
                agent=planner_agent,
                callback=analyze_callback
            )
            
            research_task = Task(
                description="Analist ajanın hazırladığı pazar raporunu inceleyerek iş fikrinin SWOT analizini çıkar. Varsa şu dosya içeriğindeki riskleri de değerlendir: {file_content}",
                expected_output="İş fikrine ait detaylı SWOT analizi ve matrisi.",
                agent=researcher_agent,
                context=[plan_task],
                callback=strategize_callback
            )
            
            write_task = Task(
                description="Toplanan analiz ve SWOT verilerini alarak, işin büyümesi için gelir modellerini, hedef kitle analizini ve kısa/uzun vadeli yol haritasını içeren bir iş planı raporu yaz. Varsa şu dosya içeriğindeki iş hedeflerini de yansıt: {file_content}",
                expected_output="İş geliştirme ve strateji raporu (Markdown formatında).",
                agent=writer_agent,
                context=[research_task],
                callback=consult_callback
            )

        else:
            # Standart İçerik Yazımı (writing) Akışı
            planner_agent = Agent(
                role="Planlayıcı Ajan (Planner)",
                goal="Gelen isteği analiz et, alt görevlere böl ve araştırmacı ajana yol haritası sun.",
                backstory="Sen detaycı bir proje yöneticisisin. Konunun en iyi şekilde işlenmesi için hangi ana başlıkların araştırılması gerektiğini planlarsın.",
                llm=local_llm,
                verbose=True,
                step_callback=make_step_callback("planner", event_queue)
            )
            
            researcher_agent = Agent(
                role="Araştırmacı Ajan (Researcher)",
                goal="Planlayıcı ajandan gelen yol haritasını al ve konuyla ilgili derinlemesine bilgi derle.",
                backstory="Sen meraklı bir araştırmacısın. Konunun tarihi, önemli gelişmeleri ve kritik verilerini toplayıp düzenli bir veri kümesi hazırlarsın.",
                llm=local_llm,
                verbose=True,
                step_callback=make_step_callback("researcher", event_queue)
            )
            
            writer_agent = Agent(
                role="Yazar Ajan (Writer)",
                goal="Araştırmacı ajandan gelen verileri al ve okuması son derece keyifli, Markdown formatında bir rapora dönüştür.",
                backstory="Sen kelimelerin ustası bir yazarsın. Ham verileri okuyucunun ilgisini çekecek, düzenli ve profesyonel bir makale haline getirirsin.",
                llm=local_llm,
                verbose=True,
                step_callback=make_step_callback("writer", event_queue)
            )
            
            # Task Callbacks
            def plan_callback(task_output):
                output_str = getattr(task_output, 'raw', str(task_output))
                event_queue.put({"event": "complete", "agent": "planner", "output": output_str})
                event_queue.put({"event": "send_data", "from": "planner", "to": "researcher", "data": "Araştırma Planı ve Odak Noktaları"})
                event_queue.put({"event": "start", "agent": "researcher"})
                event_queue.put({"event": "thought", "agent": "researcher", "content": "Kaynaklar taranıyor ve bilgiler derleniyor..."})

            def research_callback(task_output):
                output_str = getattr(task_output, 'raw', str(task_output))
                event_queue.put({"event": "complete", "agent": "researcher", "output": output_str})
                event_queue.put({"event": "send_data", "from": "researcher", "to": "writer", "data": "Ham Araştırma Bulguları"})
                event_queue.put({"event": "start", "agent": "writer"})
                event_queue.put({"event": "thought", "agent": "writer", "content": "Rapor/Makale yazılıyor..."})

            def write_callback(task_output):
                output_str = getattr(task_output, 'raw', str(task_output))
                event_queue.put({"event": "complete", "agent": "writer", "output": output_str})
                event_queue.put({"event": "final_output", "output": output_str})

            # Görevler
            plan_task = Task(
                description="Şu konuyu işlemesi için bir araştırma planı yap: {prompt}. Ana başlıkları ve odak noktalarını belirle. Ek olarak varsa şu belgeden yararlan: {file_content}",
                expected_output="Araştırmacının takip etmesi gereken 3-4 maddelik bir araştırma planı ve odak noktaları.",
                agent=planner_agent,
                callback=plan_callback
            )
            
            research_task = Task(
                description="Planlayıcı ajanın hazırladığı araştırma planı ve başlıklar doğrultusunda konuyu derinlemesine araştır. Her başlık için önemli bulguları ve bilgileri maddeler halinde topla. Varsa şu dosya içeriğinden de yararlan: {file_content}",
                expected_output="Yazara iletilecek ham araştırma bulguları ve maddeler halinde kritik bilgiler.",
                agent=researcher_agent,
                context=[plan_task],
                callback=research_callback
            )
            
            write_task = Task(
                description="Araştırmacının derlediği bulguları sentezleyerek harika bir makale/rapor yaz. Başlıkları, giriş/gelişme/sonuç bölümleri ve Markdown formatı olsun. Varsa şu dosya içeriğini de göz önünde bulundur: {file_content}",
                expected_output="Makalenin kendisi (Markdown formatında).",
                agent=writer_agent,
                context=[research_task],
                callback=write_callback
            )

        # 3. Ekibin Oluşturulması ve Çalıştırılması
        crew = Crew(
            agents=[planner_agent, researcher_agent, writer_agent],
            tasks=[plan_task, research_task, write_task],
            process=Process.sequential,
            verbose=True
        )
        
        # İlk Ajanı (Planner/Coder/Analyst) Başlat
        event_queue.put({"event": "start", "agent": "planner"})
        event_queue.put({"event": "thought", "agent": "planner", "content": "Girdi analiz ediliyor..."})
        
        # CrewAI tetikle
        crew.kickoff(inputs={"prompt": prompt, "file_content": file_ctx})
        
    except Exception as e:
        event_queue.put({"event": "error", "message": f"CrewAI Hatası: {str(e)}"})

def run_crewai_workflow(prompt, model_name, workflow="writing", file_content=""):
    """CrewAI akışını yöneten jeneratör fonksiyonu."""
    event_queue = queue.Queue()
    
    # CrewAI'ı ayrı bir thread'de başlatıyoruz (sunucuyu engellememek için)
    thread = threading.Thread(
        target=run_crewai_thread, 
        args=(prompt, model_name, workflow, file_content, event_queue)
    )
    thread.daemon = True
    thread.start()
    
    # Kuyruğa eklenen olayları çekip yield ediyoruz
    while thread.is_alive() or not event_queue.empty():
        try:
            event = event_queue.get(timeout=0.5)
            yield event
            event_queue.task_done()
        except queue.Empty:
            continue

# --- ANA GİRİŞ NOKTASI ---

def run_multi_agent_workflow(prompt, model_name="llama3", workflow="writing", file_content=""):
    """CrewAI iş akışını başlatır."""
    yield from run_crewai_workflow(prompt, model_name, workflow, file_content)
