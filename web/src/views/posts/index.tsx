import React, { useContext } from "react";

import type Post from "../../models/post";

export default ({ posts }: { posts: Post[] }) => {
  return (
    <div>
      <h1>Posts</h1>
      {posts.map((post) => (
        <div>{post.title}</div>
      ))}
    </div>
  );
};
