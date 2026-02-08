// Each artwork's placard data is structured for Gemini API output.
// Every field is optional so the UI gracefully handles whatever Gemini returns.
export const artworks = [
  {
    id: 1,
    image: '/frame.png',
    code: `const data = await fetch(url);
const json = await data.json();
const user = await getUser(json.id);
const prefs = await loadPreferences(user);
Promise.all([
  fetchAvatar(user),
  fetchHistory(user),
  fetchNotifications(user),
]).then(([avatar, history, notifs]) => {
  render(avatar, history, notifs);
});
const stream = await openStream();
await stream.pipe(transform).pipe(output);`,
    language: 'javascript',
    placard: {
      title: 'The Lecture Hall',
      filename: 'lecture_hall.js',
      artist: 'Unknown Folk Artist',
      medium: 'Carved & painted wood diorama',
      year: '1932',
      description: 'A meticulous assembly of hand-carved figures arranged in a classroom tableau. The central figure — back turned to the viewer — commands attention through absence, forcing the audience to project authority onto an anonymous silhouette.',
      details: [
        { label: 'Origin', value: 'São Paulo, Brazil' },
        { label: 'Dimensions', value: '45 × 60 × 30 cm' },
        { label: 'Collection', value: 'Private' },
      ],
    },
  },
  {
    id: 2,
    image: '/frame.png',
    code: `const data = await fetch(url);
const json = await data.json();
const user = await getUser(json.id);
const prefs = await loadPreferences(user);
Promise.all([
  fetchAvatar(user),
  fetchHistory(user),
  fetchNotifications(user),
]).then(([avatar, history, notifs]) => {
  render(avatar, history, notifs);
});
const stream = await openStream();
await stream.pipe(transform).pipe(output);`,
    language: 'javascript',
    placard: {
      title: 'Assembly of Gazes',
      filename: 'assembly_of_gazes.py',
      artist: 'Unknown Folk Artist',
      medium: 'Carved & painted wood diorama',
      year: '1934',
      description: 'Thirty-two pairs of eyes stare outward from their miniature world. Each face is unique yet collectively anonymous — a meditation on the crowd as both individual and organism.',
      details: [
        { label: 'Origin', value: 'São Paulo, Brazil' },
        { label: 'Dimensions', value: '45 × 60 × 30 cm' },
      ],
    },
  },
  {
    id: 3,
    image: '/frame.png',
    code: `square = lambda x: x * x

double = lambda x: x * 2

add = lambda a, b: a + b

pipe = lambda *fns: lambda x: reduce(lambda v, f: f(v), fns, x)

transform = pipe(double, square, str)`,
    language: 'python',
    placard: {
      title: 'The Weight of Attention',
      filename: 'weight_of_attention.py',
      artist: 'Unknown Folk Artist',
      medium: 'Carved & painted wood diorama',
      year: '1935',
      description: 'The overhead lamp — crude yet deliberate — serves as the only vertical element in a horizontally dominated composition. Light itself becomes a character, dividing the space between speaker and spoken-to.',
      details: [
        { label: 'Origin', value: 'São Paulo, Brazil' },
        { label: 'Condition', value: 'Minor restoration' },
      ],
    },
  },
  {
    id: 4,
    image: '/frame.png',
    code: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

def flatten(lst):
    result = []
    for item in lst:
        if isinstance(item, list):
            result.extend(flatten(item))
        else:
            result.append(item)
    return result

def power(base, exp):
    if exp == 0:
        return 1
    if exp % 2 == 0:
        half = power(base, exp // 2)
        return half * half
    return base * power(base, exp - 1)

def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)`,
    language: 'python',
    placard: {
      title: 'Furniture as Architecture',
      filename: 'furniture_architecture.py',
      artist: 'Unknown Folk Artist',
      medium: 'Carved & painted wood diorama',
      year: '1933',
      description: 'The chairs and desks form a geometry of containment. Each seat is both sanctuary and cage — the viewer is invited to consider where comfort ends and confinement begins.',
      details: [
        { label: 'Origin', value: 'São Paulo, Brazil' },
        { label: 'Acquired', value: '1978' },
      ],
    },
  },
  {
    id: 5,
    image: '/frame.png',
    code: `compose = lambda f, g: lambda x: f(g(x))

identity = lambda x: x

const = lambda x: lambda _: x

flip = lambda f: lambda a: lambda b: f(b)(a)

fmap = lambda f: lambda xs: list(map(f, xs))

filter_by = lambda p: lambda xs: list(filter(p, xs))

fold = lambda f, acc: lambda xs: reduce(f, xs, acc)`,
    language: 'python',
    placard: {
      title: 'Study in Ochre',
      filename: 'study_in_ochre.py',
      artist: 'Unknown Folk Artist',
      medium: 'Carved & painted wood diorama',
      year: '1936',
      description: 'The warm ochre palette unifies disparate forms into a single atmosphere. Skin, wood, and earth share the same tonal family — suggesting that in this world, people and their surroundings are made of the same material.',
      details: [
        { label: 'Origin', value: 'São Paulo, Brazil' },
        { label: 'Exhibition History', value: 'São Paulo Biennale, 1981' },
      ],
    },
  },
  {
    id: 6,
    image: '/frame.png',
    code: `import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';

const CommentatorOrb = ({ analyser, onSoundActiveChange }) => {
  const mountRef = useRef(null);
  const groupRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;
    if (!analyser) return;

    const currentMount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000
    );
    camera.position.set(0, 0, 100);
    camera.lookAt(scene.position);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    groupRef.current = group;
    group.scale.set(0.8, 0.8, 0.8);
    scene.add(group);

    const geometry = new THREE.TorusKnotGeometry(8, 1.2, 256, 20);
    // ...
  }, [analyser, onSoundActiveChange]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default CommentatorOrb;`,
    language: 'javascript',
    placard: {
      title: 'The Democratic Stage',
      filename: 'democratic_stage.jsx',
      artist: 'Unknown Folk Artist',
      medium: 'Carved & painted wood diorama',
      year: '1937',
      description: 'No figure is elevated above the platform they all share. The "stage" is merely a wooden plank — raw, functional, honest. Democracy here is not aspirational but structural.',
      details: [
        { label: 'Origin', value: 'São Paulo, Brazil' },
        { label: 'Provenance', value: 'Estate of Maria de Souza' },
      ],
    },
  },
  {
    id: 7,
    image: '/frame.png',
    code: `fn main() {
    let mut v: Vec<Box<dyn Shape>> = Vec::new();
    v.push(Box::new(Circle { radius: 5.0 }));
    v.push(Box::new(Rect { w: 3.0, h: 4.0 }));

    for shape in &v {
        match shape.kind() {
            ShapeKind::Round => println!("area: {:.2}", shape.area()),
            ShapeKind::Angular => {
                let p = shape.perimeter();
                if p > 10.0 {
                    println!("large: {:.2}", p);
                } else {
                    println!("small: {:.2}", p);
                }
            }
        }
    }

    let total: f64 = v.iter().map(|s| s.area()).sum();
    let avg = total / v.len() as f64;
    println!("avg area: {avg:.2}");
}`,
    language: 'rust',
    placard: {
      title: 'Rust & Geometry',
      filename: 'shapes.rs',
      artist: 'Unknown Folk Artist',
      medium: 'Oxidized copper relief on slate',
      year: '1941',
      description: 'Pattern matching rendered in corroded metal — each branch a separate oxidation state. The compiler\'s certainty becomes the artist\'s constraint: every possibility accounted for, no edge left unfinished.',
      details: [
        { label: 'Origin', value: 'Berlin, Germany' },
        { label: 'Dimensions', value: '38 × 38 cm' },
      ],
    },
  },
  {
    id: 8,
    image: '/frame.png',
    code: `func fanOut(jobs <-chan int, workers int) <-chan string {
    results := make(chan string, workers)
    var wg sync.WaitGroup

    for i := 0; i < workers; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            for job := range jobs {
                time.Sleep(time.Millisecond * time.Duration(rand.Intn(100)))
                results <- fmt.Sprintf("worker %d: processed %d", id, job)
            }
        }(i)
    }

    go func() {
        wg.Wait()
        close(results)
    }()

    return results
}`,
    language: 'go',
    placard: {
      title: 'Concurrent Voices',
      filename: 'fanout.go',
      artist: 'Unknown Folk Artist',
      medium: 'Woven thread on perforated board',
      year: '1944',
      description: 'Parallel threads converge on a single channel. The goroutines — invisible workers — leave traces in colored thread that cross and tangle, a textile map of concurrency made tangible.',
      details: [
        { label: 'Origin', value: 'Kyoto, Japan' },
        { label: 'Dimensions', value: '50 × 50 cm' },
      ],
    },
  },
  {
    id: 9,
    image: '/frame.png',
    code: `typedef struct Node {
    int data;
    struct Node *left;
    struct Node *right;
} Node;

Node *insert(Node *root, int val) {
    if (root == NULL) {
        Node *n = malloc(sizeof(Node));
        n->data = val;
        n->left = n->right = NULL;
        return n;
    }
    if (val < root->data)
        root->left = insert(root->left, val);
    else if (val > root->data)
        root->right = insert(root->right, val);
    return root;
}

void inorder(Node *root, void (*visit)(int)) {
    if (!root) return;
    inorder(root->left, visit);
    visit(root->data);
    inorder(root->right, visit);
}`,
    language: 'c',
    placard: {
      title: 'Memory Palace',
      filename: 'bst.c',
      artist: 'Unknown Folk Artist',
      medium: 'Burnt wood pyrography on birch panel',
      year: '1938',
      description: 'Pointers trace invisible lines between allocated blocks. Each node a room, each branch a corridor — the binary tree as architectural blueprint, memory as physical space one can walk through.',
      details: [
        { label: 'Origin', value: 'Helsinki, Finland' },
        { label: 'Condition', value: 'Excellent' },
      ],
    },
  },
  {
    id: 10,
    image: '/frame.png',
    code: `interface EventBus<T extends Record<string, unknown>> {
  on<K extends keyof T>(event: K, handler: (payload: T[K]) => void): () => void;
  emit<K extends keyof T>(event: K, payload: T[K]): void;
}

function createBus<T extends Record<string, unknown>>(): EventBus<T> {
  const listeners = new Map<keyof T, Set<Function>>();

  return {
    on(event, handler) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(handler);
      return () => listeners.get(event)?.delete(handler);
    },
    emit(event, payload) {
      for (const fn of listeners.get(event) ?? []) {
        try { fn(payload); }
        catch (e) { console.error(e); }
      }
    },
  };
}`,
    language: 'typescript',
    placard: {
      title: 'Signal & Noise',
      filename: 'event_bus.ts',
      artist: 'Unknown Folk Artist',
      medium: 'Ink and gold leaf on vellum',
      year: '1939',
      description: 'Type parameters as calligraphic constraints — each generic boundary a rule the ink must obey. Events fire into the void; handlers catch what they can. The rest is silence.',
      details: [
        { label: 'Origin', value: 'Vienna, Austria' },
        { label: 'Exhibition History', value: 'Documenta IX, 1992' },
      ],
    },
  },
]
