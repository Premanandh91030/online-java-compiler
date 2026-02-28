# Specification

## Summary
**Goal:** Rename the site to "PREMJI COMPILER" and add Scanner-based stdin input support for Java code execution.

**Planned changes:**
- Update the browser tab `<title>`, navbar brand text, and login page heading to display "PREMJI COMPILER"
- Add a stdin/input textarea on the editor page so users can provide input values before running code
- Detect Scanner usage in Java code and prominently highlight the input field when Scanner is present
- Pass user-provided stdin values to the code execution API (Piston/Judge0) as standard input
- If Scanner is used but no input is provided, send empty input to prevent indefinite hanging

**User-visible outcome:** The site is branded as "PREMJI COMPILER" throughout, and users can type stdin values that are correctly passed to Java programs using `Scanner` for input.
