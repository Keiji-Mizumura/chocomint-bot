const getProgressBarColor = (pp_rank) => {
    if (pp_rank === 0 || pp_rank > 500000) return '#7d7d7d'; 
    if (pp_rank <= 500) return '#ffe600'; 
    if (pp_rank <= 2500) return '#FF33FF'; 
    if (pp_rank <= 10000) return '#00FFFF'; 
    if (pp_rank <= 17500) return '#a86eff'; 
    if (pp_rank <= 25000) return '#3399FF';
    if (pp_rank <= 40000) return '#FFD700'; 
    if (pp_rank <= 75000) return '#AAAAAA'; 
    if (pp_rank <= 200000) return '#CD7F32'; 
    return '#7d7d7d'; // Default fallback
}

module.exports = { getProgressBarColor };