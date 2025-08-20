# 🚀 **Grafana Setup Guide - Immediate Action Required**

## 📋 **Step 1: Access Grafana Dashboard**

**Open your browser and go to:** http://localhost:3002

## 🔑 **Step 2: Login Credentials**

- **Username:** `admin`
- **Password:** `admin`
- **⚠️ IMPORTANT:** You'll be prompted to change the password on first login

## ⚙️ **Step 3: Add Prometheus Data Source**

1. **Go to Configuration** → **Data Sources**
2. **Click "Add data source"**
3. **Select "Prometheus"**
4. **Set URL to:** `http://prometheus:9090`
5. **Click "Save & Test"**
6. **✅ Should show "Data source is working"**

## 📊 **Step 4: Import Sample Dashboards**

### **Dashboard 1: System Overview**
1. **Go to Dashboards** → **Import**
2. **Enter Dashboard ID:** `1860`
3. **Click "Load"**
4. **Select Prometheus as data source**
5. **Click "Import"**

### **Dashboard 2: Docker Monitoring**
1. **Go to Dashboards** → **Import**
2. **Enter Dashboard ID:** `315`
3. **Click "Load"**
4. **Select Prometheus as data source**
5. **Click "Import"**

## 🎯 **Step 5: Create Vision Platform Dashboard**

1. **Click "+" → "Dashboard"**
2. **Add Panel** → **"Add a new panel"**
3. **Add these panels:**

### **Panel 1: Service Health**
- **Title:** "Vision Platform Services"
- **Query:** `up{job=~"vision.*"}`
- **Visualization:** Stat
- **Field:** Value

### **Panel 2: Translation Requests**
- **Title:** "Translation Requests/sec"
- **Query:** `rate(translation_requests_total[5m])`
- **Visualization:** Time series

### **Panel 3: OpenAI API Usage**
- **Title:** "OpenAI API Calls/sec"
- **Query:** `rate(openai_api_calls_total[5m])`
- **Visualization:** Time series

## 🔍 **Step 6: Verify Data Collection**

1. **Check if Prometheus is collecting metrics**
2. **Go to Prometheus** → http://localhost:9090
3. **Click "Status" → "Targets"**
4. **Look for targets with "UP" status**

## 📱 **Step 7: Set Up Alerts (Optional)**

1. **Go to Alerting** → **Alert Rules**
2. **Create rule for service down:**
   - **Name:** "Service Down Alert"
   - **Query:** `up{job=~"vision.*"} == 0`
   - **Duration:** 1m
   - **Severity:** Critical

## 🎉 **You're Done!**

Your monitoring is now set up. You can:
- **View real-time metrics** in Grafana
- **Monitor service health** with alerts
- **Track AI feature usage** and performance
- **Identify bottlenecks** and issues

---

**🔗 Quick Links:**
- **Grafana:** http://localhost:3002
- **Prometheus:** http://localhost:9090
- **Vision Platform:** http://localhost:3000

