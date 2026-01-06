export default function HowItWorksPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h1>How Deklata Works</h1>

      <p style={{ color: "#475569", marginBottom: 32 }}>
        Deklata helps students safely share items they no longer need with
        others on campus.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* STEP 1 */}
        <div>
          <h3>1. Browse available items</h3>
          <p>
            Anyone can browse items shared by students — books, electronics,
            furniture, clothing, and more.
          </p>
        </div>

        {/* STEP 2 */}
        <div>
          <h3>2. Create an account to request or add items</h3>
          <p>
            To request an item or share your own, you need to create an account
            and log in.
          </p>
        </div>

        {/* STEP 3 */}
        <div>
          <h3>3. Request an item</h3>
          <p>
            When you request an item, the owner is notified and can choose to
            approve or reject your request.
          </p>
        </div>

        {/* STEP 4 */}
        <div>
          <h3>4. Contact is shared only after approval</h3>
          <p>
            For safety and privacy, the owner’s contact details are hidden at
            first.
          </p>
          <p>
            Once the owner approves your request, their contact information
            becomes visible to you. You can then call or message each other to
            agree on a convenient pickup time and location.
          </p>
        </div>

        {/* STEP 5 */}
        <div>
          <h3>5. Pick up the item</h3>
          <p>
            Meet up, collect the item, and enjoy! Items are removed from the
            marketplace once they’ve been successfully picked up.
          </p>
        </div>
      </div>

      {/* ===============================
          SAFE PICKUP UX
         =============================== */}
      <div
        style={{
          marginTop: 48,
          padding: 24,
          borderRadius: 16,
          background: "#f8fafc",
          border: "1px solid #e5e7eb",
        }}
      >
        <h2>How to pick up safely</h2>

        <ul style={{ paddingLeft: 18, lineHeight: 1.7 }}>
          <li>
            Arrange pickups in <strong>public or well-lit places</strong> on
            campus.
          </li>
          <li>
            If possible, meet during <strong>daytime hours</strong>.
          </li>
          <li>
            Let a friend or roommate know where you’re going.
          </li>
          <li>
            Avoid sharing extra personal information beyond what’s needed.
          </li>
          <li>
            If something feels uncomfortable, you are free to cancel the
            pickup.
          </li>
        </ul>

        <p style={{ marginTop: 16, color: "#475569" }}>
          Deklata is designed to encourage respectful, safe exchanges between
          students. Always trust your instincts.
        </p>
      </div>
    </div>
  );
}
