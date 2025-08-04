// @ts-expect-error: No types available
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

export default async function  textExtractor(files: File[]):Promise<string[]>{
    let extracted_text:string[] = []
    for(const file of files){
        const file_extension = file.name.split('.').pop()?.toLowerCase() ?? ''
        const buffer = Buffer.from(await file.arrayBuffer())

        switch(file_extension){
            case 'pdf':{
                const text = await pdfParse(buffer)
                extracted_text.push(`--- ${file.name} ---\n${text.text}`)
                break
            }
            case 'docx': {
                const text = await mammoth.extractRawText({buffer})
                extracted_text.push(`--- ${file.name} ---\n${text.value}`)
                break
            }
            case 'txt':
            case 'js':
            case 'ts':
            case 'py':
            case 'json':
            case 'html':
            case 'css': {
                const text = buffer.toString('utf-8');
                extracted_text.push(`--- ${file.name} ---\n${text}`)
                break
            }
            case 'xlsx':{
                const workbook = XLSX.read(buffer, { type: 'buffer' });
                const sheets: string[] = workbook.SheetNames;
                        
                const textParts: string[] = [];
                        
                for (const sheetName of sheets) {
                  const worksheet = workbook.Sheets[sheetName];
                
                  if (!worksheet) continue;
                
                  const csv: string = XLSX.utils.sheet_to_csv(worksheet);
                  textParts.push(`Sheet: ${sheetName}\n${csv}`);
                }
            
                 const text = textParts.join('\n\n');
                 extracted_text.push(`--- ${file.name} ---\n${text}`)
            }
        }
    }
    return extracted_text
}