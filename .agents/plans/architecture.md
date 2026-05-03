# 🏗️ 시스템 아키텍처

## 전체 구조
브레인 싱크는 4개의 주요 레이어로 구성됨.

### 1. Extraction Layer (Chrome Extension)
- 역할: 사용자가 보고 있는 웹 페이지의 대화 내용(ChatGPT, Claude 등)을 추출.
- 기술: JavaScript (Content Scripts), Chrome Messaging API.

### 2. Orchestration Layer (FastAPI)
- 역할: API 엔드포인트 제공, 데이터 가공, LLM 호출 관리.
- 기술: Python, FastAPI, Pydantic, SQLAlchemy.

### 3. Storage Layer
- **Relational**: PostgreSQL (원본 보관, 메타데이터 관리)
- **Vector**: Qdrant (임베딩 데이터 저장, 시맨틱 검색)

### 4. Presentation Layer (Next.js)
- 역할: 저장된 지식 시각화, 지능형 검색 UI 제공.
- 기술: TypeScript, Next.js (App Router), Tailwind CSS.

---
[[README|← Back to Map]]
