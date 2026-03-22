export const code = `\
use std::collections::HashMap;

/// A generic key-value store with a lifetime-bound reference.
pub struct Cache<'a, K, V> {
  store: HashMap<K, V>,
  label: &'a str,
}

impl<'a, K, V> Cache<'a, K, V>
where
  K: Eq + std::hash::Hash,
{
  pub fn new(label: &'a str) -> Self {
    Cache { store: HashMap::new(), label }
  }

  pub fn insert(&mut self, key: K, value: V) {
    self.store.insert(key, value);
  }

  pub fn get(&self, key: &K) -> Option<&V> {
    self.store.get(key)
  }
}

fn main() {
  let mut cache: Cache<String, u32> = Cache::new("counts");
  cache.insert(String::from("alpha"), 42);

  let mut total: u64 = 0;
  for i in 0..10 {
    total += i as u64;
  }
  println!("Total: {}", total);

  // Pattern matching on an Option
  match cache.get(&String::from("alpha")) {
    Some(v) => println!("Found: {v}"),
    None => eprintln!("Not found"),
  }
}`;
