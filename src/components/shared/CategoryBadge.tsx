import { useAppStore } from '../../store';

interface CategoryBadgeProps {
  categoryId: string;
}

export default function CategoryBadge({ categoryId }: CategoryBadgeProps) {
  const categories = useAppStore((s) => s.categories);
  const category = categories.find((c) => c.id === categoryId);

  if (!category) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
        Unknown
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        backgroundColor: `${category.color}22`,
        color: category.color,
      }}
    >
      {category.name}
    </span>
  );
}
