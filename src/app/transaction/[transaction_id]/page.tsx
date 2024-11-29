import TransactionComplete from "@/components/TransactionComplete";

const Transaction = async ({ params }: { params: Promise<{ transaction_id: string }> }) => {
    const resolvedParams = await params;
    console.log(resolvedParams.transaction_id);
    return (
        <div>
            <TransactionComplete transactionId={resolvedParams.transaction_id} />
        </div>
    )
}

export default Transaction
