// Payment methods available at checkout. Each one's QR code image is
// shown once the customer selects it, right before the upload-proof field.

const PAYMENT_METHODS = [
  { id: "gcash", label: "GCash", qr: "https://nqtegxusqnehiljqijrn.supabase.co/storage/v1/object/public/qr-codes/GCash.png" },
  { id: "bdo", label: "BDO", qr: "https://nqtegxusqnehiljqijrn.supabase.co/storage/v1/object/public/qr-codes/BDO.png" },
  { id: "gotyme", label: "GoTyme", qr: "https://nqtegxusqnehiljqijrn.supabase.co/storage/v1/object/public/qr-codes/GoTyme.png" },
  { id: "maribank", label: "Maribank", qr: "https://nqtegxusqnehiljqijrn.supabase.co/storage/v1/object/public/qr-codes/Maribank.png" },
  { id: "cimbbank", label: "CIMB Bank", qr: "https://nqtegxusqnehiljqijrn.supabase.co/storage/v1/object/public/qr-codes/Cimbank.png" },
];
