import { getLatestNews } from '@/services/news';
import NewsFeed from '@/components/app/news-feed';

export default async function Home() {
  // Fetch initial news data on the server
  const initialNews = await getLatestNews('example.com'); // Replace with actual source if needed

  return (
    <div className="container mx-auto p-4 md:p-6">
      <NewsFeed initialNews={initialNews} />
    </div>
  );
}
