function BusRoute({ route, onViewDetail=()=>{} }) {
  const viewDetail = (temproute) => {
    onViewDetail(temproute)
  }
  return (
    <>
      {route.toTableRow(viewDetail)}
    </>
  );
}




export default BusRoute;