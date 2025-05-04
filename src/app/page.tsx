import { getLatestNews } from '@/services/news';
import NewsFeed from '@/components/app/news-feed';

export default async function Home() {
  // Fetch initial news data on the server from dawn.com (simulated)
  const initialNews = await getLatestNews('dawn.com');

  return (
    <div className="container mx-auto p-4 md:p-6">
      <NewsFeed initialNews={initialNews} />
    </div>
  );
}
