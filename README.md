## **Image Upload & Labeling Service**

### **Goal:**
Build a fullstack app where users can:
- Upload single/multiple images.
- Track upload and processing progress.
- View image previews, metadata, and labels.
- See a list of all uploads and their statuses.

---

### **Frontend (React + TypeScript):**
- Upload images with progress indicators.
- Show per-image processing status.
- Display image preview, metadata (name, size, dimensions), and labels.
- View a list of all uploads with their overall and per-image progress.

---

### **Backend:**
- Can be implemented in any language.
- API must be implemented in Typescript.

---

### **Processing Requirements:**
- Store uploaded images.
- Extract metadata: file name, size, dimensions.
- Label each image with:
  - **Objects** (e.g., car, dog, tree).
  - **Scene type** (e.g., selfie, landscape, indoor, nature, city).
- Use any image classification or vision model/API.
- All image processing must be asynchronous.

---

### **Constraints:**
- Frontend must be in **TypeScript**.
- Backend API must be in **TypeScript**.
- API responses must be **type-safe and consumable by a TypeScript frontend**.
- No restriction on tools or libraries.

---

### **Deliverables:**
- GitHub repo with `/frontend` and `/backend`.
- README with setup and implementation notes.
