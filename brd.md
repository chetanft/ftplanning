Business Requirements Document (BRD)
Dispatch Planning Tool for Cuboidal and Cylindrical Objects
1. Document Control
Document Title: BRD – Dispatch Planning Tool for Cuboidal and Cylindrical Objects
Version: 1.0
Prepared By: [Your Name]
Date: [Insert Date]

2. Purpose
To design and develop a Dispatch Planning Tool capable of optimizing and automating truck loading and dispatch planning for both cuboidal and cylindrical cargo, catering to industries such as FMCG, Pharma, Tyres, Paint, and Paper.

3. Scope
In Scope:
Load optimization for cuboidal and cylindrical items
3D truck load visualization
Truck load building based on stacking and orientation rules
Route optimization
Configurable constraints (e.g., max stacking height, weight limits, axle load, LIFO/FIFO rules)
Out of Scope:
Real-time GPS tracking
Driver management
Freight settlement or payment processing

4. Business Objectives
Reduce logistics cost by maximizing truck utilization
Ensure safety and compliance with load stacking norms
Improve dispatch planning accuracy and speed
Enable flexible planning based on product types and constraints

5. Stakeholders
Stakeholder
Role
Logistics Planner
Primary user of the tool
Warehouse Operations
Load execution
Transportation Manager
Approval and oversight
IT / Development Team
Build and maintain the tool
Finance
Cost optimization reporting


6. Functional Requirements
6.1. Cuboidal Objects Planning Module
6.1.1 Input Parameters
Object dimensions (L×W×H)
Object weight
Stackability (yes/no)
Max stacking height
Palletized (yes/no)
Load bearing capacity
6.1.2 Constraints
Stacking rules (e.g., heavy below light)
Max truck height, width, and length
Center of gravity balance
LIFO/FIFO stacking preference
Full vs partial load support
6.1.3 Features
3D visualization of load plan
Load cube utilization metric (%)
Automated load sequencing
Support for multi-drop routing
Export load plan (PDF/Image/CSV)

6.2. Cylindrical Objects Planning Module
6.2.1 Input Parameters
Diameter and height
Weight
Orientation rules (vertical, horizontal)
Nesting capability (yes/no)
Palletized (yes/no)
6.2.2 Constraints
Non-stackable if fragile
Interlocking rules for stability
Axle load distribution
Avoid rolling risk
Loading using wedges/braces if required
6.2.3 Features
3D load layout visualization (stacked/unstacked)
Circular load footprint optimization
Automatic calculation of void space
Support for mixed load (e.g., cylinders + cuboids)
Output: load diagram, safety instructions

7. Non-Functional Requirements
Performance: Load plans must be generated within 2 seconds for up to 100 items.
Usability: Web-based UI with drag-and-drop interface.
Security: Role-based access control.
Scalability: Capable of handling multiple concurrent planning sessions.
Integrations: API integration with ERP, WMS, and TMS platforms.

8. Assumptions
Accurate master data (product dimensions/weights) is available.
All trucks have standard dimension profiles available in system.

9. Dependencies
Integration with routing engine for route optimization
Availability of real-time inventory or dispatch data
3D rendering library for load visualization

10. Success Metrics
≥ 90% average truck utilization
≤ 5% dispatches requiring re-planning
≥ 80% adherence to stacking and safety rules
Time to plan per truck < 2 minutes





















Product Specification Document (PRD)
Dispatch Planning Tool: Cuboidal & Cylindrical Load Optimization
1. Product Overview
Product Name: SmartDispatch Planner
Purpose: To enable optimal truck loading and dispatch planning for both cuboidal and cylindrical objects using 3D load optimization, route planning, and stacking rules.

2. Goals and Objectives
Achieve high truck space utilization (target >90%)
Reduce manual effort and planning errors in dispatch
Ensure safe and compliant stacking
Enable planning of both uniform and mixed-type loads (cuboidal + cylindrical)
Provide intuitive 3D visualization for warehouse execution teams

3. Key Use Cases
#
User
Description
1
Planner
Optimize loads for cuboidal cartons for a full truck dispatch
2
Planner
Plan cylindrical items (e.g., drums, rolls) with safety and space usage in mind
3
Planner
Combine cuboidal and cylindrical items in a single load plan
4
Manager
View utilization reports and approve dispatch plans
5
Operator
View and execute load plan based on 3D visual output


4. Feature Specifications
4.1. Common Core Features
Load Configuration
Select truck type from preloaded profiles
Set constraints (max weight, stacking height, axle limits)
Route Optimization
Optimize delivery sequence for multi-drop routes
Optional integration with third-party routing APIs
3D Load Plan Viewer
View colored layout of items inside truck
Rotate, zoom, and inspect individual items
Export Options
Download load plan in PDF/Image
API support for system integration

4.2. Cuboidal Load Planning Module
Input Fields:
Length, Width, Height
Weight
Stackable (Y/N)
Max stack height
Orientation flexibility (Y/N)
Logic & Constraints:
Heavy below light stacking
Full coverage base rule (no overhang)
Prevent tipping by stacking within CoG
FIFO/LIFO constraints if needed
Output:
Truck fill % by volume and weight
Stacking layers
Load sequencing for route order

4.3. Cylindrical Load Planning Module
Input Fields:
Diameter, Height
Orientation preference (vertical/horizontal)
Nesting allowed (Y/N)
Fragility indicator (Y/N)
Logic & Constraints:
Interlocking to reduce rolling risk
Stacked or unstacked based on rules
Use of wedges or barriers in layout (visual suggestion)
Avoid horizontal stacking for fragile items
Output:
Void space calculation
Axle load distribution balance
3D rendering showing cylinder orientation

4.4. Mixed Load Planner (Cuboidal + Cylindrical)
Define priority by volume or dispatch sequence
Apply separate stacking logic for each type
Optimize for void minimization and balance

5. UX/UI Design Requirements
Planning Screen
Form-based data entry for item dimensions
Truck selector with preview
Load simulation button
3D Load Viewer
Interactive truck view with:
Rotation, zoom, section slicing
Load item info on hover
Color codes by item type
Load Plan Summary
Utilization stats
Load sequence chart
Constraint violations (warnings)
Mobile/Tablet Support
Read-only viewer for warehouse team

6. Technical Requirements
6.1. Architecture
Web-based application (React + Node.js preferred)
Backend optimization engine (Python, C++, or Go)
REST API endpoints for input/output
3D rendering library (Three.js or Babylon.js)
6.2. Integrations
ERP/WMS APIs for item master and dispatch orders
Google Maps or GraphHopper for route optimization (optional)
PDF/Image export services

7. Constraints & Assumptions
No real-time tracking integration
Product weights and dimensions assumed accurate
Standard truck dimension presets will be used
No cold chain or hazardous load requirements

8. Milestones
Milestone
Description
Target Date
M1
MVP with cuboidal planner & 3D viewer
[Insert Date]
M2
Cylindrical module with nesting logic
[Insert Date]
M3
Mixed load support
[Insert Date]
M4
Export & reporting tools
[Insert Date]
M5
API & ERP integration
[Insert Date]





https://www.pier2pier.com/loadcalc/
