import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, Container, Form, Button } from "react-bootstrap";
import DashboardLayout from "../../components/DashboardLayout";
import axios from "axios";
import { useUserAuth } from "../../contexts/UserAuthContext";
import {
  FaUserCircle,
  FaLaughBeam,
  FaSmile,
  FaMeh,
  FaFrown,
  FaSadTear,
} from "react-icons/fa";
import { IconContext } from "react-icons/lib";
import formatDate from "../../utils/formatDate";
import { getAuth } from "firebase/auth";
import PostComments from "../../components/PostCommentView";

const PostViewPage = () => {
  const { postId } = useParams();
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [emoticon, setEmoticon] = useState(0);
  const [post, setPost] = useState({});
  const [author, setAuthor] = useState({});
  const [newComment, setNewComment] = useState("");
  const [commentRefreshKey, setCommentRefreshKey] = useState(Date.now());

  const getAuthHeader = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const postRes = await axios.get(`/api/post/${postId}`);
        const _post = postRes.data;
        setPost(_post);

        const sentimentDecimal = Number(_post.sentiment?.$numberDecimal || 0);
        if (sentimentDecimal < -0.5) setEmoticon(-2);
        else if (sentimentDecimal < 0) setEmoticon(-1);
        else if (sentimentDecimal === 0) setEmoticon(0);
        else if (sentimentDecimal < 0.5) setEmoticon(1);
        else setEmoticon(2);

        const headers = await getAuthHeader();
        const authorRes = await axios.get("/api/auth/get-user-by-id", {
          params: { id: _post.author._id },
          headers,
        });
        setAuthor(authorRes.data);
      } catch (err) {
        console.error("Error fetching post or author data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId]);

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const headers = await getAuthHeader();
      const userResponse = await axios.get("/api/auth/get-user-by-email", {
        params: { email: user.email },
        headers,
      });
      const userId = userResponse.data._id;

      await axios.post(
        "/api/comment/add",
        { postId, content: newComment, userId },
        { headers }
      );

      setNewComment("");
      setCommentRefreshKey(Date.now()); // triggers refetch in PostComments
    } catch (error) {
      console.error("Error posting the comment", error);
    }
  };

  return (
    <DashboardLayout>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Container className="post-view-container">
          <IconContext.Provider value={{ size: 45 }}>
            <Card className="mb-3 shadow post-data-card">
              <Card.Body>
                <Card.Title>
                  <h2>{post.title}</h2>
                </Card.Title>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <FaUserCircle />
                  <span className="ms-2">
                    <strong>{author.name}</strong>
                    <p className="text-muted">{formatDate(post.date)}</p>
                  </span>
                </div>
                <Card.Text className="mt-2" style={{ minHeight: 200 }}>
                  {post.content}
                </Card.Text>
                <div>
                  Mood:{" "}
                  {emoticon === -2 && <FaSadTear color="darkred" />}
                  {emoticon === -1 && <FaFrown color="orangered" />}
                  {emoticon === 0 && <FaMeh color="gray" />}
                  {emoticon === 1 && <FaSmile color="limegreen" />}
                  {emoticon === 2 && <FaLaughBeam color="green" />}
                </div>
                <hr />
                <Form onSubmit={submitComment}>
                  <Form.Group className="mb-2">
                    <Form.Label>Add a new comment:</Form.Label>
                    <Form.Control
                      as="textarea"
                      placeholder="Type your comment here..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Button type="submit" disabled={!newComment.trim()}>
                    Submit
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </IconContext.Provider>

          <Card className="shadow">
            <Card.Body>
              <PostComments postId={postId} refreshSignal={commentRefreshKey} />
            </Card.Body>
          </Card>
        </Container>
      )}
    </DashboardLayout>
  );
};

export default PostViewPage;
