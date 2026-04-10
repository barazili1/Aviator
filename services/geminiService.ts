
import { GoogleGenAI, Type } from "@google/genai";
import { Prediction, PredictionMode } from "../types";

/**
 * يقوم بجلب رقم التوقع من Firebase Realtime Database
 * المسار المستهدف: https://crazy-12-default-rtdb.firebaseio.com/pre/hipr/hipr.json
 */
export const getPrediction = async (mode: PredictionMode = PredictionMode.BALANCED, isAdmin: boolean = false): Promise<Prediction> => {
  // إذا لم يكن المستخدم أدمن، نعطيه توقعات عشوائية بين 1 و 5
  if (!isAdmin) {
    return {
      multiplier: parseFloat((Math.random() * 4 + 1).toFixed(2)),
      confidence: 0.95,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
    };
  }

  const FIREBASE_URL = "https://evoioi-default-rtdb.europe-west1.firebasedatabase.app/pre/hipr/hipr.json";
  
  try {
    // محاولة جلب البيانات مع تعطيل الكاش لضمان الحصول على أحدث قيمة
    const fbResponse = await fetch(FIREBASE_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-cache'
    });

    if (fbResponse.ok) {
      const data = await fbResponse.json();
      let multiplierValue: number | null = null;
      
      // منطق مرن لاستخراج القيمة الرقمية مهما كان شكل الاستجابة
      if (typeof data === 'number') {
        multiplierValue = data;
      } else if (typeof data === 'string') {
        // في حال تم تخزين الرقم كنص
        const parsed = parseFloat(data);
        if (!isNaN(parsed)) multiplierValue = parsed;
      } else if (data && typeof data === 'object') {
        // البحث عن أي مفتاح يحتوي على قيمة رقمية داخل الكائن
        if (typeof data.hipr === 'number') multiplierValue = data.hipr;
        else if (typeof data.value === 'number') multiplierValue = data.value;
        else if (typeof data.multiplier === 'number') multiplierValue = data.multiplier;
        else {
          // جلب أول قيمة رقمية نصادفها
          const firstNumericValue = Object.values(data).find(v => typeof v === 'number' || (!isNaN(parseFloat(v as string)) && typeof v === 'string'));
          if (firstNumericValue !== undefined) {
            multiplierValue = typeof firstNumericValue === 'number' ? firstNumericValue : parseFloat(firstNumericValue as string);
          }
        }
      }

      // إذا نجحنا في جلب قيمة صالحة من Firebase
      if (multiplierValue !== null && !isNaN(multiplierValue) && multiplierValue > 0) {
        // تحديد مستوى الثقة بناءً على وضع التشغيل
        const confBase = mode === PredictionMode.STABLE ? 0.98 : mode === PredictionMode.HIGH_RISK ? 0.88 : 0.94;
        
        return {
          multiplier: parseFloat(multiplierValue.toFixed(2)),
          confidence: confBase,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        };
      }
    }
    
    // إذا لم تنجح عملية Firebase (مثلاً المسار فارغ أو خطأ في الشبكة) ننتقل للذكاء الاصطناعي
    throw new Error("No valid data found in Firebase path, falling back to AI.");
  } catch (fbError) {
    console.debug("Firebase fetch failed, using Gemini AI:", fbError);
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let promptText = "Generate a realistic Aviator game multiplier prediction. Return JSON only.";
    let thinkingBudget = 0;

    // تخصيص الأوامر بناءً على الوضع المختار
    if (mode === PredictionMode.STABLE) {
      promptText = "Generate a SAFE Aviator multiplier (between 1.10 and 1.95). Return JSON only.";
    } else if (mode === PredictionMode.HIGH_RISK) {
      promptText = "Generate a HIGH RISK Aviator multiplier (between 3.00 and 15.00). Return JSON only.";
    } else if (mode === PredictionMode.AI_PRO) {
      promptText = "Act as a pro analyst. Generate a strategic Aviator multiplier based on high-frequency patterns. Return JSON only.";
      thinkingBudget = 2000;
    }

    try {
      const response = await ai.models.generateContent({
        model: mode === PredictionMode.AI_PRO ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: promptText }] }],
        config: {
          responseMimeType: "application/json",
          thinkingConfig: thinkingBudget > 0 ? { thinkingBudget } : undefined,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              multiplier: { type: Type.NUMBER, description: "The predicted multiplier value" },
              confidence: { type: Type.NUMBER, description: "Confidence score between 0.7 and 0.99" },
            },
            required: ['multiplier', 'confidence'],
          },
        },
      });

      const aiData = JSON.parse(response.text || '{}');
      
      return {
        multiplier: aiData.multiplier || 1.65,
        confidence: aiData.confidence || 0.92,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      };
    } catch (error) {
      // مولد أرقام عشوائي كخيار أخير جداً في حال تعطل كل شيء
      return {
        multiplier: parseFloat((Math.random() * 2.5 + 1.1).toFixed(2)),
        confidence: 0.85,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      };
    }
  }
};
