# INSpace - Product Requirements Document

## Original Problem Statement
Create a modern enterprise web application UI for an Insurance Risk Analytics platform. Deliverables: high-fidelity screens (Portfolio View, Flood Expected ON, Exposed assets list, Asset Detail overlay), interaction spec, production-ready React + ArcGIS integration notes, and example code.

## User Choices
- Mock data only (no real API/data source)
- INSpace branding preserved from video reference
- No authentication required
- Frontend demonstration with Leaflet maps (mock ArcGIS-style)

## Architecture

### Frontend (React 19)
- Header with INSpace branding and navigation
- KPI Bar with dynamic metrics
- Left Panel: Controls, Filters, Layers, Selection Tools
- Center: Interactive Map (React-Leaflet)
- Right Panel: Selection and Property Details

### Backend (FastAPI)
- RESTful API with /api prefix
- Mock data generation for assets and flood zones
- KPI calculation endpoints
- MongoDB integration (optional persistence)

## User Personas
1. **Portfolio Managers**: Monitor overall portfolio health and GIV exposure
2. **Risk Analysts**: Analyze flood exposure and simulate catastrophe scenarios
3. **Actuaries**: Access detailed asset information for underwriting decisions

## Core Requirements (Static)
- [x] Portfolio View with asset visualization
- [x] Event Simulation mode with flood layer
- [x] Dynamic KPI calculations
- [x] Asset filtering by type
- [x] Flood zone visualization with opacity control
- [x] Asset detail overlay with property information
- [x] Collapsible panels for flexible layout
- [x] Search functionality
- [x] Base map switching

## What's Been Implemented
**Date: 2026-02-13**
- Complete INSpace UI matching video reference
- Header with Portfolio View / Event Simulation toggle
- KPI Bar with portfolio and flood-specific metrics
- Left Panel with Base Maps, Filters, Layers, Selection Tools
- Map View with 85 mock assets across San Francisco
- 4 flood zones (primary, secondary, fringe categories)
- Right Panel with Selection and Property Details tabs
- Asset click interaction showing detailed information
- Flood opacity slider and "Show only exposed" toggle
- Flood zone legend with color coding
- README with GitHub integration instructions
- GitHub Actions CI/CD pipeline template

## Prioritized Backlog

### P0 (Critical) - COMPLETED
- [x] Core UI layout matching video reference
- [x] Map with asset markers
- [x] Flood layer toggle and visualization
- [x] KPI calculations
- [x] Asset selection and details

### P1 (High Priority) - Future
- [ ] Real ArcGIS JS API integration
- [ ] Server-side KPI calculations for large datasets
- [ ] Lasso/polygon selection tool implementation
- [ ] Export functionality (PDF reports)

### P2 (Medium Priority) - Future
- [ ] User authentication
- [ ] Save/load user preferences
- [ ] Multiple flood scenario comparisons
- [ ] Historical data analysis

### P3 (Nice to Have) - Future
- [ ] Dark mode support
- [ ] Mobile responsive design
- [ ] Real-time data streaming
- [ ] Custom flood scenario creation

## Next Tasks
1. Connect to real ArcGIS FeatureLayer services
2. Implement lasso/polygon selection tool
3. Add export/print functionality
4. Performance optimization for large asset datasets
