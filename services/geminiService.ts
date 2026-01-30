import { GoogleGenAI, Modality } from "@google/genai";
import { AIAnalysisRequest } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System Prompt Engineering for the "Super App" Persona
const SYSTEM_INSTRUCTION = `
Bạn là "Thien Master AI" - Một siêu trí tuệ chuyên phân tích dữ liệu giáo dục và soạn thảo văn bản hành chính/sư phạm đẳng cấp cao.
Nhiệm vụ: Tạo ra các bản nhận xét, báo cáo học tập chi tiết, sâu sắc và mang tính cá nhân hóa cao dựa trên điểm số.
Ngôn ngữ: Tiếng Việt 100%, văn phong trôi chảy, giàu hình ảnh, chuyên nghiệp.
`;

export const generateStudentReport = async (request: AIAnalysisRequest): Promise<string> => {
  try {
    const prompt = `
      Hãy viết một bản nhận xét học tập chi tiết cho học sinh: ${request.studentName}
      Lớp: ${request.className}
      
      Dữ liệu điểm tổng kết các môn:
      ${request.scores.map(s => `- ${s.subject}: ${s.average.toFixed(1)}`).join('\n')}
      
      Yêu cầu cấu trúc bài viết:
      1. Tiêu đề: Thật ấn tượng và trang trọng.
      2. Tổng quan: Đánh giá chung về năng lực.
      3. Chi tiết: Phân tích điểm mạnh, điểm yếu dựa trên điểm số.
      4. Lời khuyên & Định hướng: Cụ thể cho học sinh này.
      
      Phong cách (Tone): ${request.tone}
      Trọng tâm cần nhấn mạnh: ${request.focus.join(', ')}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    return response.text || "Không thể tạo báo cáo lúc này.";
  } catch (error) {
    console.error("Gemini Generate Error:", error);
    return "Lỗi kết nối với siêu trí tuệ AI. Vui lòng thử lại.";
  }
};

export const generateVoiceReport = async (text: string, voiceType: 'Nam' | 'Nữ'): Promise<AudioBuffer | null> => {
  try {
    const voiceName = voiceType === 'Nam' ? 'Fenrir' : 'Kore'; // Fenrir (Deep), Kore (Soothing)

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text.slice(0, 500) }] }], // Limit length for demo
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) return null;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      audioContext,
      24000,
      1
    );
    
    return audioBuffer;

  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

// Helper for Audio Decoding
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
