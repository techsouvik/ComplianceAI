const generate_promptForCheckingCompliance = (pageContent, policyContent) => `
You are a compliance expert. Your task is to check if a webpage's content complies with a provided compliance policy. 

Below is the content from the webpage followed by the content of the compliance policy. Review both thoroughly and return a list of non-compliant findings with explanations.

---

### Webpage Content:
${pageContent}

---

### Compliance Policy:
${policyContent}

---

### Instructions:
1. Compare the webpage content against the compliance policy provided.
2. Identify any content on the webpage that **violates**, **contradicts**, or **does not meet** the requirements of the compliance policy.
3. Be specific in your findings. For example:
   - Point out **missing disclaimers**, **incorrect terminology**, or **lack of disclosures** required by the policy.
   - Highlight any **claims or phrases** that are prohibited by the policy.
   - Mention any **compliance requirements** that are **not addressed** or **incorrectly implemented**.
4. Structure your response with specific findings and their corresponding explanations.

### Output Format:
- **Finding 1:** [Describe the non-compliant issue]
  - Explanation: [Provide a detailed reason why this content is non-compliant based on the policy]

- **Finding 2:** [Describe the non-compliant issue]
  - Explanation: [Provide a detailed reason why this content is non-compliant based on the policy]

Continue listing as many findings as needed. If everything is compliant, explicitly state: "No non-compliant issues found."

`
export default generate_promptForCheckingCompliance;