import { useEffect, useState } from "react";
import { Row, Col, Card } from "react-bootstrap";
import Calendar from "../../components/Calendar";
import DashboardLayout from "../../components/DashboardLayout";
import axios from "axios";
import { useUserAuth } from "../../contexts/UserAuthContext";
import GraphView from "../../components/GraphView";
import { getAuth } from "firebase/auth";

const Insights = () => {
  const [posts, setPosts] = useState([]);
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [moodAnalytics, setMoodAnalytics] = useState(null);

  // Helper: Get Firebase Auth header with token
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
      setLoading(true);
      try {
        const headers = await getAuthHeader();

        // Fetch user info by email
        const userRes = await axios.get("api/auth/get-user-by-email", {
          params: { email: user.email },
          headers,
        });

        const userId = userRes.data._id;

        // Fetch posts
        const postsRes = await axios.get(`api/post/user/${userId}`, {
          headers,
        });
        setPosts(postsRes.data);

        // Fetch mood analytics
        const analyticsRes = await axios.get("api/analytics/mood", {
          headers,
        });

        if (analyticsRes.data.moodFrequency) {
          setMoodAnalytics(analyticsRes.data);
        } else {
          setMoodAnalytics({
            averageMoodRating: null,
            moodFrequency: {},
            totalPosts: 0,
          });
        }
      } catch (error) {
        console.error("Failed to load your insights. Please try again.", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchData();
    }
  }, [user.email]);

  return (
    <DashboardLayout>
      <div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <h2 className="mt-3 mb-3">Track your feelings!</h2>

            {/* Mood Analytics Summary */}
            {moodAnalytics && (
              <Row className="mb-4">
                <Col md={4}>
                  <Card className="shadow-sm p-3 mb-3">
                    <h5>Average Mood Rating (last 30 days):</h5>
                    <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                      {moodAnalytics.averageMoodRating || "N/A"}
                    </p>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="shadow-sm p-3 mb-3">
                    <h5>Total Posts:</h5>
                    <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                      {moodAnalytics.totalPosts}
                    </p>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="shadow-sm p-3 mb-3">
                    <h5>Mood Frequency:</h5>
                    {moodAnalytics.moodFrequency &&
                    Object.keys(moodAnalytics.moodFrequency).length > 0 ? (
                      <ul style={{ paddingLeft: "1rem" }}>
                        {Object.entries(moodAnalytics.moodFrequency).map(
                          ([mood, count]) => (
                            <li key={mood}>
                              <strong>{mood}</strong>: {count}
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p>No mood data available.</p>
                    )}
                  </Card>
                </Col>
              </Row>
            )}

            {/* Graph View */}
            <Row className="mb-5 mt-2">
              <Col xs={12} xl={8}>
                <GraphView posts={posts} />
              </Col>
              <Col xs={12} xl={4} className="journals-list-text">
                <h1>Mood Chart</h1>
                <p>
                  This graph provides insights into your mood over a period of
                  time. Positive values on the graph indicate that the user
                  experienced a good mood, while negative values suggest a
                  not-so-good mood. By tracking these values, you can gain
                  insights into your emotional well-being and identify any
                  patterns or triggers that may be impacting your mood.
                </p>
              </Col>
            </Row>

            {/* Calendar View */}
            <Row className="mt-5">
              <Col xs={12} xl={4} className="journals-list-text">
                <h1>Calendar</h1>
                <p>
                  This calendar tracks your mood on a daily basis, with red
                  indicating a negative or bad mood, yellow representing a
                  neutral mood, and green indicating a positive or good mood. By
                  using these colors to represent your mood, you can easily
                  visualize patterns and trends in your emotional well-being
                  over time.
                </p>
              </Col>
              <Col xs={12} xl={8}>
                <Calendar posts={posts} />
              </Col>
            </Row>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Insights;
