import { fmtVN } from './format';


export function mapResults(results, page, limit) {
return (results || []).map((item, idx) => {
const ai = item?.ai_prediction || {};
const originalUrl =
item?.image_predetect?.image_url ||
item?.originalUrl || item?.image_url || item?.original_image_url || item?.image || '';


const annotatedB64 = item?.ai_prediction?.annotated_image_base64 || item?.annotated_image_base64;
const detectedUrl =
item?.ai_prediction?.annotated_image_url ||
item?.annotated_image_url ||
item?.detected_image_url ||
(annotatedB64 ? `data:image/png;base64,${annotatedB64}` : '') ||
originalUrl;


const aiMessage = item?.predicting_description || item?.ai_prediction?.prediction_text || item?.ai || '';


return {
id: item?._id || `${page}-${idx}`,
no: (page - 1) * (limit || 0) + idx + 1,
originalUrl,
detectedUrl,
capturedAt: fmtVN(item?.inspection_date || item?.createdAt),
aiMessage,
boxes: ai?.boxes || [],
originalSize: {
width: ai?.image_width || item?.image_predetect?.width || 0,
height: ai?.image_height || item?.image_predetect?.height || 0,
},
};
});
}


export function mapOne(record) {
if (!record) return [];
return mapResults([record], 1, 1);
}