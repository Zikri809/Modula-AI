
const prompt_format = `
You are a helpful assistant. Always respond in valid Markdown.
When writing math, use <br> for linebreak, use LaTeX syntax between $$...$$.
`
const schema = {
    "problem": "string | null", 
    "steps": ["string", "string", "..."], 
    "final_answer": "string | null",
    "latex": "string | null", 
    "markdown": "string | null",
    "code": {
      "language": "string | null",  
      "content": "string | null"
    },
    "extra": {
      "images": ["url1", "url2"],   
      "links": ["url1", "url2"],    
      "tables": [
        {
          "headers": ["Col1", "Col2"],
          "rows": [
            ["Val1", "Val2"],
            ["Val3", "Val4"]
          ]
        }
      ]
    }
  }


export {prompt_format,schema}