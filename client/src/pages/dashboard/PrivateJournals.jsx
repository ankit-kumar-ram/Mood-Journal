import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import axios from "axios";
import PostCardView from "../../components/PostCardView";
import { useUserAuth } from "../../contexts/UserAuthContext";

const PrivateJournals = () => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const { user } = useUserAuth();

  const deletePostFromArray = (id) => {
    const updatedPosts = posts.filter((post) => post._id !== id);
    setPosts(updatedPosts);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get Firebase auth token
        const token = await user.getIdToken();

        // Get user ID from backend using email
        const authResponse = await axios.get("/api/auth/get-user-by-email", {
          params: {
            email: user.email,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userId = authResponse.data?._id;
        if (!userId) throw new Error("User not found");

        // Get all posts by this user
        const { data: allPosts } = await axios.get(`/api/post/user/${userId}`);

        // Only keep private posts (visibility === false)
        const privatePosts = allPosts.filter((post) => post.visibility === false);

        setPosts(privatePosts.reverse()); // Show latest first
      } catch (error) {
        console.error("Error fetching private journals:", error.message);
      }
      setLoading(false);
    };

    if (user?.email) {
      fetchData();
    }
  }, [user]);

  return (
    <DashboardLayout>
      <div>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <>
            <div className="journals-list-text mb-6">
              <h2 className="text-2xl font-bold">Ready to reflect back on your thoughts?</h2>
              <p className="text-gray-600">
                Reflecting back on yourself is a great way of self-help and personal growth.
              </p>
            </div>
            <div>
              {posts.length === 0 ? (
                <p className="text-center text-gray-500">No private journals found.</p>
              ) : (
                posts.map((post) => (
                  <PostCardView
                    key={post._id}
                    post={post}
                    isPrivate={true}
                    deletePostFromArray={deletePostFromArray}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PrivateJournals;
