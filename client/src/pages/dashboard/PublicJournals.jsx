import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import axios from "axios";
import PostCardView from "../../components/PostCardView";
import { useUserAuth } from "../../contexts/UserAuthContext";

const PublicJournals = () => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const { user } = useUserAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let headers = {};

        if (user) {
          const token = await user.getIdToken();
          headers.Authorization = `Bearer ${token}`;
        }

        const { data: response } = await axios.get("/api/post/", { headers });

        response.reverse();
        setPosts(response);
      } catch (error) {
        console.error(error.response?.data || error.message);
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  return (
    <DashboardLayout>
      <div>
        {loading && <div>Loading...</div>}
        {!loading && (
          <div>
            <div className="journals-list-text">
              <h2>Want to see what others are upto?</h2>
              <p>
                Read and relate to other people. Probably you can help them in some way too? Just drop a friendly comment.
              </p>
            </div>
            <div>
              {posts.map((post) => (
                <PostCardView key={post._id} post={post} isPrivate={false} />
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PublicJournals;
