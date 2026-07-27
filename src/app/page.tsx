import TodoApp from "./TodoApp";

export default function Home() {
  return (
    <div className="flex flex-1 items-start justify-center bg-background px-4 py-12 sm:py-20">
      <TodoApp />
    </div>
  );
}
