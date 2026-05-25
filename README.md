# ICyBolts

![ICyBolts Screenshot](./docs/images/IC%20Bolt%20Analysis.png)

ICyBolts is an interactive bolt group analysis application for structural engineers built with React, TypeScript, Vite, and Three.js. The software solves for the **Instantaneous Center of Rotation (IC)** of eccentrically loaded bolt groups using the **Brandt Method** published in AISC design references.

The tool is intended for rapid visualization and evaluation of:

- AISC bolt group coefficient checks
- Bolt bearing design
- Slip-critical bolt checks
- Eccentrically loaded bolt groups
- Instantaneous center equilibrium analysis
- Bolt demand / capacity ratios (DCR)
- Interactive structural connection review

The application combines a modern dark-themed engineering UI with a live Three.js viewport for rapid structural analysis and visualization.

---

# Live Application

ICyBolts is available online at:

https://re-tug.com/icybolts/

---

# Engineering Background

ICyBolts implements the **Brandt Method** for instantaneous center analysis of bolt groups:

> **Rapid Determination of Ultimate Strength of Eccentrically Loaded Bolt Groups**  
> *G. Donald Brandt*

The solver iteratively determines the location of the instantaneous center of rotation and distributes bolt forces based on nonlinear deformation relationships described in the AISC methodology.

The software is particularly well suited for:

- AISC eccentric bolt group checks
- Bolt coefficient ("C") calculations
- Bearing bolt capacity evaluation
- Slip-critical bolt evaluation
- Structural steel connection design workflows

---

# Features

## Bolt Group Analysis

- Instantaneous center of rotation solver
- Brandt method implementation
- Nonlinear bolt force distribution
- Bolt force vector visualization
- Real-time DCR evaluation
- Bolt group coefficient (C) calculations

## Bolt Design Checks

### Bearing Bolts

- AISC bearing bolt capacities
- ASD and LRFD support
- Bolt grade selection
- Single and double shear checks

### Slip-Critical Bolts

- Slip coefficient (μ) support
- Faying surface selection
- Standard and short-slot hole support
- ASD and LRFD capacities
- Slip-critical resistance checks

---

# Interactive 3D Visualization

The project uses:

- React Three Fiber
- Three.js
- Drei

to provide:

- Interactive bolt visualization
- Force vector rendering
- Instantaneous center visualization
- Selection tools
- Dynamic bolt highlighting
- Live analysis feedback

---

# Current Functionality

## File Tools

- Save project to JSON
- Import project from JSON
- Print analysis results to PDF

## Bolt Editing

- Parametric bolt grid generation
- Interactive bolt selection
- Multi-select editing
- Drag window selection
- Ctrl-click selection support

## Load Definition

- Point load input
- Magnitude and angle control
- Applied force visualization

## Results

- Bolt coefficient output
- Maximum bolt DCR
- Capacity checks
- Force equilibrium review
- Instantaneous center display
- Bolt-by-bolt force results

---

# Technology Stack

- React
- TypeScript
- Vite
- Three.js
- React Three Fiber
- Drei

---

# Project Structure

```text
src/
├── analysis/
│   ├── analyzeBoltGroup.ts
│   └── brandt.ts
│
├── components/
│   ├── BoltPanel.tsx
│   ├── LoadPanel.tsx
│   ├── AppliedLoadArrow.tsx
│   ├── BoltSelectionBox.tsx
│   ├── BottomDock.tsx
│   └── FilePanel.tsx
│
├── data/
│   └── boltSizes.ts
│
├── types/
│   ├── bolts.ts
│   └── app.ts
│
├── App.tsx
└── main.tsx
```

---

# Analysis Workflow

1. Define bolt geometry
2. Create applied loads
3. Run instantaneous center analysis
4. Review bolt force vectors
5. Review bolt coefficient and DCR
6. Print engineering summary to PDF

---

# Future Development

Planned future enhancements include:

- Eurocode bolt design support
- Metric bolt capacity libraries

---

# References

- AISC Steel Construction Manual
- AISC Design Guide Resources
- Brandt, G. Donald  
  *Rapid Determination of Ultimate Strength of Eccentrically Loaded Bolt Groups*

---

# Screenshots

The screenshot below shows ICyBolts solving an eccentrically loaded slip-critical bolt group with instantaneous center visualization and live force vectors.

![ICyBolts Screenshot](./docs/images/IC%20Bolt%20Analysis.png)

---

# License

MIT License

Copyright (c) 2026 Austin Guter, Retug LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

# Author

Austin Guter  
Retug LLC