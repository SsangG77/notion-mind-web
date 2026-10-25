import type { Lang } from "@/lib/i18n";

/**
 * 요금제 화면의 설명 글. 카드 아래에 붙는다.
 *
 * 카드는 숫자만 보여 주므로 "1,000개가 실제로 어떤 의미인지", "누가 결제를 처리하는지",
 * "해지하면 언제까지 쓰는지" 같은 것은 여기서 문장으로 답한다.
 * ⚠️ 코드가 실제로 하는 일만 적는다 — 구현되지 않은 약속을 쓰지 않는다.
 */
interface Block {
  heading: string;
  body: string[];
}

export const PRICING_COPY: Record<Lang, { title: string; blocks: Block[] }> = {
  ko: {
    title: "요금제에 대해 자주 궁금해하는 것",
    blocks: [
      {
        heading: "노드 1,000개는 실제로 어느 정도인가요",
        body: [
          "Free 는 워크스페이스에서 최근에 수정한 순서로 페이지와 데이터베이스를 1,000개까지 그립니다. 페이지가 그보다 적으면 Free 와 Pro 의 그래프는 완전히 같습니다. 1,000개를 넘으면 그 뒤의 오래된 페이지가 화면에 나타나지 않고, 우상단에 몇 개 중 몇 개를 보고 있는지 표시됩니다.",
          "Pro 는 20,000개까지 올라갑니다. 노션 API 가 한 번에 100개씩만 돌려주기 때문에 큰 워크스페이스는 그래프가 채워지는 동안 기다리게 되는데, 이건 요금제가 아니라 노션 쪽 속도 제한입니다.",
        ],
      },
      {
        heading: "Free 와 Pro 에서 그래프 기능 차이가 있나요",
        body: [
          "보는 기능에는 차이가 없습니다. 관계형 점선, 호버 포커스, 노드 상세 패널, 검색, 연결 없는 노드 필터는 Free 에서도 전부 동작합니다.",
          "차이는 결과가 남느냐입니다. Free 에서 노드를 숨기거나 핀으로 고정하면 그 브라우저 세션에서만 유지되고, 새로 고치면 처음 상태로 돌아옵니다. Pro 는 그 설정을 서버에 저장해 다른 브라우저나 기기에서 열어도 그대로입니다. 여기에 5분 간격 자동 동기화, 보고 있는 화면을 PNG 로 내보내기, 광고 제거가 붙습니다.",
        ],
      },
      {
        heading: "결제는 누가 처리하나요",
        body: [
          "Paddle 이 판매자로서 결제를 처리합니다. 카드 번호는 Paddle 의 결제창에서만 입력되고 이 서비스의 서버로는 오지 않습니다. 영수증과 세금 서류도 Paddle 이 발행합니다.",
          "표시 금액은 미국 달러이고 부가세가 포함된 가격입니다. 월 결제와 연 결제 중에 고를 수 있고, 연 결제는 같은 기간을 월 결제로 낼 때보다 쌉니다.",
        ],
      },
      {
        heading: "해지하면 언제까지 쓸 수 있나요",
        body: [
          "언제든 해지할 수 있고, 해지해도 이미 결제한 기간이 끝날 때까지는 Pro 로 남습니다. 그 뒤로 자동 갱신만 멈춥니다. 해지는 그래프 화면의 설정 패널에서 구독 관리를 누르면 열리는 Paddle 고객 포털에서 합니다. 같은 자리에서 카드 교체와 월, 연 전환도 됩니다.",
          "환불은 결제일로부터 14일 이내면 전액입니다. 첫 결제뿐 아니라 갱신 결제에도 같은 기간이 적용됩니다.",
        ],
      },
      {
        heading: "해지하면 그래프와 설정은 어떻게 되나요",
        body: [
          "그래프는 그대로 쓸 수 있습니다. Free 상한인 1,000개로 돌아가고, 저장해 둔 숨김과 핀은 다시 세션 한정으로 동작합니다.",
          "워크스페이스 내용은 애초에 서버에 쌓지 않습니다. 제목과 속성과 관계는 노션에서 읽어 브라우저로 전달될 뿐이고, 서버에 남는 것은 구독 상태와 Pro 가 저장한 숨김, 핀 목록입니다. 설정 패널에서 노션 연결을 해제하면 서버에 보관하던 접근 토큰은 즉시 지워집니다.",
        ],
      },
    ],
  },
  en: {
    title: "What people ask about the plans",
    blocks: [
      {
        heading: "How much is 1,000 nodes, really",
        body: [
          "Free draws up to 1,000 pages and databases, taken in order of most recently edited. If your workspace is smaller than that, the Free graph and the Pro graph are identical. Past 1,000 the older pages are left out, and the counter in the top right tells you how many of your total you are looking at.",
          "Pro raises the ceiling to 20,000. Notion's API hands back a hundred pages per request, so a large workspace fills in while you watch — that wait comes from Notion's rate limit, not from the plan.",
        ],
      },
      {
        heading: "Do the plans differ in what the graph can do",
        body: [
          "Not in what you can see. Relation lines, hover focus, the node detail panel, search and the unconnected filter all work on Free.",
          "They differ in whether your choices survive. On Free, hiding a node or pinning one lasts for that browser session and resets on reload. Pro stores those choices on the server, so the same layout is there in another browser or on another device. Pro also adds a five-minute automatic sync, PNG export of the current view, and no ads.",
        ],
      },
      {
        heading: "Who processes the payment",
        body: [
          "Paddle acts as the merchant of record. Card details are entered in Paddle's checkout and never reach this service's servers, and Paddle issues the receipt and the tax paperwork.",
          "Prices are in US dollars with VAT included. You can pay monthly or yearly, and the yearly price works out cheaper than paying month by month for the same period.",
        ],
      },
      {
        heading: "What happens when you cancel",
        body: [
          "You can cancel at any time and Pro stays active until the period you already paid for runs out; only the renewal stops. Cancelling happens in Paddle's customer portal, which opens from the subscription row in the settings panel. The same portal is where you change the card or switch between monthly and yearly.",
          "A refund is the full amount within 14 days of a payment. That window applies to renewals as well as to the first charge.",
        ],
      },
      {
        heading: "What happens to the graph and the saved settings",
        body: [
          "The graph keeps working. It returns to the Free ceiling of 1,000 nodes, and hidden nodes and pins go back to lasting only for the session.",
          "Your workspace content was never piled onto a server to begin with. Titles, properties and relations are read from Notion and passed to your browser; what stays on the server is the subscription state and the hidden and pinned lists Pro saved. Disconnecting Notion in the settings panel deletes the stored access token straight away.",
        ],
      },
    ],
  },
};
