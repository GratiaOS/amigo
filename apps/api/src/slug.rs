use rand::{distributions::Alphanumeric, Rng};

pub fn gen_slug(len: usize) -> String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(len)
        .map(char::from)
        .collect::<String>()
        .to_lowercase()
}
