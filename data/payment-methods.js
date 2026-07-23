// Payment methods available at checkout. Each one's QR code image is
// shown once the customer selects it, right before the upload-proof field.

const PAYMENT_METHODS = [
  { id: "gcash", label: "GCash", qr: "https://res.cloudinary.com/tvj7qspg/image/upload/f_auto,q_auto/GCash_o2rlwp" },
  { id: "bdo", label: "BDO", qr: "https://res.cloudinary.com/tvj7qspg/image/upload/f_auto,q_auto/BDO_rda2wo" },
  { id: "gotyme", label: "GoTyme", qr: "https://res.cloudinary.com/tvj7qspg/image/upload/f_auto,q_auto/GoTyme_q5k6ib" },
  { id: "maribank", label: "Maribank", qr: "https://res.cloudinary.com/tvj7qspg/image/upload/f_auto,q_auto/Maribank_asolis" },
  { id: "cimbbank", label: "CIMB Bank", qr: "https://res.cloudinary.com/tvj7qspg/image/upload/f_auto,q_auto/Cimbank_tvls0x" },
];
