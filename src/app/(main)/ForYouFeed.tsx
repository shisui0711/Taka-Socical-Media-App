"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import kyInstance from "@/lib/ky";
import { PostsPage } from "@/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";

export default function ForYouFeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "for-you"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/posts/for-you",
          pageParam ? { searchParams: { cursor: pageParam } } : {}
        )
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];
  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <div className="flex-center h-[60vh]">
        <p className="text-center text-muted-foreground">
          Chưa có bài viết nào phù hợp. Tạo một bài viết và chia sẻ với bạn bè!
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex-center h-[60vh]">
        <p className="text-center text-destructive">
          Có lỗi xảy ra khi tải bài viết. Hãy tải lại trang.
        </p>
      </div>
    );
  }

  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      {isFetchingNextPage && <Loader className="animate-spin mx-auto my-3" />}
    </InfiniteScrollContainer>
  );
}
