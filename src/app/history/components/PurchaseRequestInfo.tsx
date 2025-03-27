

interface RequestInfo {
  date: string;
  requester: string;
  message: string;
}

const PurchaseRequestInfo = ({ requestInfo }: { requestInfo: RequestInfo }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-lg font-bold">요청 정보</h2>
      <p className="text-sm text-gray-500">{requestInfo.date}</p>
      <div className="mt-2">
        <p className="text-sm text-gray-700">요청인</p>
        <p className="border p-2 rounded-md">{requestInfo.requester}</p>
      </div>
      <div className="mt-2">
        <p className="text-sm text-gray-700">요청 메시지</p>
        <p className="border p-2 rounded-md">{requestInfo.message}</p>
      </div>
    </div>
  );
};

export default PurchaseRequestInfo;
