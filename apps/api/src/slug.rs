use rand::Rng;

// Jose Thor spec: No ambiguous chars (no i, l, 1, 0, o)
// Easy to dictate, write, transcribe
const CHARSET: &[u8] = b"abcdefghjkmnpqrstuvwxyz23456789";

pub fn gen_slug(len: usize) -> String {
    let mut rng = rand::thread_rng();
    (0..len)
        .map(|_| {
            let idx = rng.gen_range(0..CHARSET.len());
            CHARSET[idx] as char
        })
        .collect()
}
