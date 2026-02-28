// Intentionally minimal – pages handle their own loading states via Suspense/skeletons.
// A full-screen SYNC here blocks navigation for every route.
export default function Loading() {
    return null;
}
