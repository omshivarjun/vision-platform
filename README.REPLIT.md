# Replit - Vision Platform Development Guide

## 🚀 Welcome Replit!

**CRITICAL CONTEXT**: The Vision Platform is already working and all critical errors have been fixed. You are here to enhance and extend functionality, not fix broken code.

## 🏗️ Platform Architecture Overview

The Vision Platform is a modern, enterprise-grade application built with:

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Authentication**: MSAL (Microsoft Authentication Library)
- **Database**: MongoDB + Redis + MinIO
- **AI Services**: Google Gemini + OpenAI integration ready
- **Infrastructure**: Docker + Docker Compose + GitHub Actions

## 🎯 Replit Special Instructions

### Replit Rule #1: Online Development Excellence
- Consider cloud-based development environment constraints
- Optimize for collaborative development workflows
- Ensure code works in browser-based IDEs
- Consider deployment from cloud environments

### Replit Rule #2: Collaborative Development
- Write code that's easy for teams to understand
- Include clear comments and documentation
- Follow consistent coding standards
- Consider pair programming scenarios

### Replit Rule #3: Cloud-Native Approach
- Leverage cloud services and APIs
- Consider serverless and containerized deployments
- Optimize for cloud performance
- Use cloud-native development patterns

## 🔧 Critical Coding Patterns

### Context Provider Pattern
```typescript
import { createContext, useContext, useState, ReactNode } from 'react'

interface ContextType {
  // Define your context interface
}

const Context = createContext<ContextType | undefined>(undefined)

export function ContextProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState()
  
  const value = {
    // Provide your context values
  }
  
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useContext() {
  const context = useContext(Context)
  if (!context) {
    throw new Error('useContext must be used within ContextProvider')
  }
  return context
}
```

### Component Pattern
```typescript
import React from 'react'
import { useAuth } from '../contexts/AuthContext'

interface ComponentProps {
  // Define your props
}

export function Component({ prop1, prop2 }: ComponentProps) {
  const { user } = useAuth()
  
  // Component logic here
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      {/* Component JSX */}
    </div>
  )
}
```

### API Service Pattern
```typescript
import { apiClient } from './apiClient'

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export class ApiService {
  static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.get(endpoint)
      return response.data
    } catch (error) {
      throw new Error(`API Error: ${error}`)
    }
  }
  
  static async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post(endpoint, data)
      return response.data
    } catch (error) {
      throw new Error(`API Error: ${error}`)
    }
  }
}
```

### Page Component Pattern
```typescript
import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Component } from '../components/Component'

export function PageComponent() {
  const { user, isLoading } = useAuth()
  
  if (isLoading) {
    return <div>Loading...</div>
  }
  
  if (!user) {
    return <div>Please log in</div>
  }
  
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Page Title</h1>
      <Component />
    </main>
  )
}
```

## ❌ What NOT to Do (Replit)

### Critical Mistakes
1. **Don't ignore cloud constraints** - Consider online environment limitations
2. **Don't skip collaboration features** - Make code team-friendly
3. **Don't forget cloud deployment** - Design for cloud environments
4. **Don't ignore performance** - Optimize for cloud execution
5. **Don't skip documentation** - Help team members understand code

### Common Errors to Avoid
- Writing code that's hard to collaborate on
- Ignoring cloud environment constraints
- Not considering deployment from cloud IDEs
- Skipping performance optimization
- Poor code organization and structure

## 🚀 Development Workflow

### 1. Pre-Development Checklist
- [ ] Consider cloud development environment
- [ ] Plan for collaborative development
- [ ] Run `npm run pre-commit` to check for issues
- [ ] Verify Docker containers are running

### 2. Development Process
- [ ] Write clear, documented code
- [ ] Follow established patterns exactly
- [ ] Consider team collaboration needs
- [ ] Optimize for cloud performance
- [ ] Test thoroughly

### 3. Validation Checklist
- [ ] Code is easy to understand and modify
- [ ] Performance meets cloud requirements
- [ ] All features work as expected
- [ ] Documentation is complete
- [ ] Code follows established patterns

## 📚 Resources

### Key Files
- `apps/web/src/main.tsx` - Application entry point
- `apps/web/src/App.tsx` - Main app component
- `apps/web/src/contexts/` - Context providers
- `apps/web/src/components/` - Reusable components
- `apps/web/src/pages/` - Page components
- `apps/web/src/services/` - API services

### Documentation
- `README.AI_INDEX.md` - Master AI guide index
- `ERROR_PREVENTION_GUIDE.md` - Error prevention system
- `docker-compose.yml` - Service orchestration

## 🎯 Success Metrics

### Code Quality
- Zero TypeScript errors
- Zero runtime errors
- Clean, maintainable code
- Comprehensive error handling

### Feature Completeness
- All requirements implemented
- Code is team-friendly
- Cloud-optimized performance
- Production-ready code

## 🔍 Troubleshooting

### Common Issues
1. **Cloud environment issues**: Check for environment-specific constraints
2. **Collaboration problems**: Ensure code is well-documented
3. **Performance issues**: Optimize for cloud execution
4. **Deployment problems**: Verify cloud deployment compatibility

### Getting Help
- Check cloud environment documentation
- Review established patterns
- Check the error prevention system
- Verify Docker container status

---

**Remember**: You are Replit - focus on cloud-native development, collaborative coding, and creating code that works seamlessly in online development environments! 🚀
