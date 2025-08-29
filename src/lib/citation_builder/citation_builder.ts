import {
    Candidate,
    GenerateContentResponse,
    GroundingSupport,
} from '@google/genai';
import { GroundingChunk } from '@firebase/ai';

export default async function citation_builder(
    response: GenerateContentResponse
) {
    if (!response) return null;
    if (
        !response.text ||
        !response.candidates ||
        !response.candidates[0].groundingMetadata
    )
        return null;

    let text = response.text;
    const supports =
        response.candidates[0]?.groundingMetadata?.groundingSupports;
    const chunks = response.candidates[0]?.groundingMetadata?.groundingChunks;
    if (!supports || !chunks) return null;
    // Sort supports by end_index in descending order to avoid shifting issues when inserting.
    const sortedSupports = [...supports].sort(
        (a, b) => (b.segment?.endIndex ?? 0) - (a.segment?.endIndex ?? 0)
    );

    for (const support of sortedSupports) {
        const endIndex = support.segment?.endIndex;
        if (endIndex === undefined || !support.groundingChunkIndices?.length) {
            continue;
        }

        const citationLinks = support.groundingChunkIndices
            .map((i) => {
                const uri = chunks[i]?.web?.uri;
                if (uri) {
                    return `[${i + 1}](${uri})`;
                }
                return null;
            })
            .filter(Boolean);

        if (citationLinks.length > 0) {
            const citationString = citationLinks.join(', ');
            text =
                text.slice(0, endIndex) + citationString + text.slice(endIndex);
        }
    }

    return text;
}
