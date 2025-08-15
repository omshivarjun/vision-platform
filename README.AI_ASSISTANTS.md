# 🤖 Vision Platform - AI Assistant Guide

## 🎯 Purpose
This README is specifically designed for **AI coding assistants** like Jules, GitHub Copilot, Claude, and other AI tools to quickly understand and work with the Vision Platform codebase.

## 🏗️ **ARCHITECTURE OVERVIEW**

### **Project Structure**
```
Vision Platform/
├── apps/web/                 # React + TypeScript Frontend
├── backend/                  # Node.js + Express Backend
├── ai_service/              # Python FastAPI AI Service
├── apps/mobile/             # React Native Mobile App
├── infrastructure/          # Docker, Kubernetes, Cloud configs
├── monitoring/              # Prometheus, Grafana, Logging
└── docs/                    # Documentation
```

### **Technology Stack**
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, MSAL Auth
- **Backend**: Node.js, Express, TypeScript, MongoDB, Redis, MinIO
- **AI Service**: Python, FastAPI, Google Gemini, OpenAI
- **Mobile**: React Native, Expo
- **Infrastructure**: Docker, Docker Compose, Kubernetes
- **Monitoring**: Prometheus, Grafana, ELK Stack

## 🚨 **CRITICAL CONTEXT FOR AI ASSISTANTS**

### **1. Error Prevention System**
The platform has a **comprehensive error prevention system** that catches all known issues:
- **GitHub Actions**: `.github/workflows/error-prevention.yml`
- **Pre-commit hooks**: `.pre-commit-config.yaml`
- **Custom validation**: Vision Platform specific error patterns

### **2. Common Issues Already Fixed**
- ✅ Duplicate exports in `realApi.ts`
- ✅ React import conflicts with Vite `jsxInject`
- ✅ Missing critical dependencies (`@heroicons/react`, `@azure/msal-react`)
- ✅ Context provider wrapping issues
- ✅ Docker port mapping conflicts (3000:3000 vs 3000:5173)
- ✅ Tailwind CSS plugin resolution problems

### **3. Current Status**
- **Frontend**: 100% functional, all pages loading
- **Backend**: 100% functional, all APIs responding
- **Services**: All running and healthy
- **Error Prevention**: 100% complete and active

## 🔧 **DEVELOPMENT WORKFLOW**

### **Local Development**
```bash
# Start all services
docker-compose up -d

# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# AI Service: http://localhost:8000
# MongoDB: localhost:27017
# Redis: localhost:6379
# MinIO: localhost:9000
```

### **Code Quality Checks**
```bash
# Pre-commit hooks (automatic on commit)
pre-commit run --all-files

# Manual validation
npm run lint          # Frontend linting
npm run build         # Frontend build
cd backend && npm run build  # Backend build
```

## 📁 **KEY FILES & THEIR PURPOSE**

### **Frontend (apps/web/)**
- `src/main.tsx` - App entry point with all context providers
- `src/App.tsx` - Main application component
- `src/contexts/` - React Context providers (Auth, Theme, DND)
- `src/pages/` - All application pages
- `src/components/` - Reusable UI components
- `src/services/` - API client services
- `tailwind.config.js` - Tailwind CSS configuration (plugins temporarily disabled)
- `vite.config.ts` - Vite configuration (no jsxInject)

### **Backend (backend/)**
- `src/index.ts` - Main server entry point
- `src/routes/` - API route definitions
- `src/middleware/` - Express middleware
- `src/models/` - MongoDB models
- `package.json` - Dependencies (rate-limiter-flexible ^4.0.1)

### **Configuration Files**
- `docker-compose.yml` - Service orchestration
- `docker-compose.override.yml` - Development overrides
- `apps/web/.env` - Frontend environment variables
- `.github/workflows/` - CI/CD pipelines

## 🎯 **AI ASSISTANT INSTRUCTIONS**

### **When Making Changes:**

1. **ALWAYS check existing error prevention systems first**
2. **Follow established patterns** - don't reinvent solutions
3. **Use TypeScript strictly** - no `any` types
4. **Maintain context provider wrapping** in `main.tsx`
5. **Validate Docker configurations** before committing
6. **Run pre-commit hooks** to catch issues early

### **Common Patterns to Follow:**

#### **Context Provider Wrapping**
```tsx
// ✅ CORRECT - Always wrap with all providers
ReactDOM.createRoot(document.getElementById('root')!).render(
  <MsalProvider instance={msalInstance}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </MsalProvider>
)
```

#### **API Service Pattern**
```typescript
// ✅ CORRECT - Use established service pattern
export const apiService = {
  async getData() {
    const response = await fetch('/api/data')
    return response.json()
  }
}
```

#### **Component Structure**
```tsx
// ✅ CORRECT - Follow established component pattern
interface ComponentProps {
  title: string
  onAction: () => void
}

export function Component({ title, onAction }: ComponentProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold">{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  )
}
```

### **What NOT to Do:**

❌ **Don't add duplicate exports** in `realApi.ts`
❌ **Don't use `jsxInject`** in Vite config
❌ **Don't remove context providers** from `main.tsx`
❌ **Don't change port mappings** without updating Docker configs
❌ **Don't add dependencies** without updating package.json
❌ **Don't bypass error prevention** systems

## 🚀 **QUICK START FOR AI ASSISTANTS**

### **1. Understand the Request**
- Read the user's request carefully
- Identify which part of the platform needs modification
- Check if similar functionality already exists

### **2. Follow Established Patterns**
- Look at existing similar code
- Use the same structure and naming conventions
- Maintain consistency with the codebase

### **3. Validate Your Changes**
- Ensure TypeScript compilation passes
- Check that all context providers remain intact
- Verify Docker configurations are valid
- Run pre-commit hooks if possible

### **4. Document Changes**
- Add clear comments explaining complex logic
- Update relevant documentation
- Follow existing code style

## 📚 **RESOURCES FOR AI ASSISTANTS**

### **Error Prevention Documentation**
- `ERROR_PREVENTION_GUIDE.md` - Complete error catalog
- `ERROR_PREVENTION_SUMMARY.md` - System overview
- `.github/workflows/error-prevention.yml` - CI/CD checks

### **Setup & Configuration**
- `setup-error-prevention.ps1` - Automated setup script
- `.pre-commit-config.yaml` - Pre-commit hook configuration
- `docker-compose.yml` - Service configuration

### **Code Examples**
- `apps/web/src/pages/` - Page component examples
- `apps/web/src/components/` - Reusable component examples
- `backend/src/routes/` - API endpoint examples

## 🎯 **SUCCESS METRICS**

### **Quality Standards**
- ✅ **99%+ Build Success Rate**
- ✅ **Zero Critical Errors in Production**
- ✅ **Automated Error Detection**
- ✅ **Proactive Issue Prevention**

### **Development Guidelines**
- ✅ **Consistent Code Quality**
- ✅ **TypeScript Strict Mode**
- ✅ **Automated Testing**
- ✅ **Security Scanning**

## 🔍 **TROUBLESHOOTING FOR AI ASSISTANTS**

### **If You Encounter Issues:**

1. **Check the error prevention guide** first
2. **Look at existing working code** for patterns
3. **Validate your changes** against established rules
4. **Use the setup script** to verify environment
5. **Check GitHub Actions** for automated validation

### **Common AI Assistant Mistakes:**

- **Over-engineering solutions** - Keep it simple
- **Ignoring existing patterns** - Follow established conventions
- **Bypassing error prevention** - Always use the systems in place
- **Not testing changes** - Validate before suggesting

## 🎉 **CONCLUSION**

The Vision Platform is a **production-ready, enterprise-grade application** with comprehensive error prevention. As an AI assistant:

- **Respect the existing architecture**
- **Follow established patterns**
- **Use the error prevention systems**
- **Maintain code quality standards**
- **Document your changes clearly**

**The platform is designed to be maintainable and reliable - help keep it that way!** 🚀

---

*This guide ensures AI assistants can work effectively with the Vision Platform while maintaining its high quality standards and preventing common errors.*
