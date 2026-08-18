---
title: 最小生成树
date: 2023-03-01 12:00:00
categories: 
- OI
- 图论
cover: assets/006.jpg
description: 最小生成树的定义与性质，以及 Kruskal、Prim 两种算法的实现思路与复杂度分析。
math: true
mermaid: true
---

# 定义及性质

如果连通图的一个子图是一棵包含所有顶点的树，则该子图称为其的生成树。

生成树是连通图的包含图中的所有顶点的极小连通子图，无环，只有 $n-1$ 条边。

图的生成树不唯一。从不同的顶点出发进行遍历，可得到不同的生成树。

无向连通图的最小生成树为边权和最小的生成树。

# 算法实现
常见的最小生成树算法有 Kruskal 算法和 Prim 算法。

Kruskal 的时间复杂度为 $O(m\log m)$ ，适合**稀疏图**。

暴力 Prim 的时间复杂度为 $O(n^2+m)$ ，适合于**稠密图**。

堆优化 Prim 类似 Dijkstra 的堆优化，但如果使用二叉堆等不支持 $O(1)$ decrease-key 的堆，复杂度就不优于 Kruskal ，常数也比 Kruskal 大。

**一般情况下使用 Kruskal 算法**。在稠密图尤其是完全图上，暴力 Prim 的复杂度比 Kruskal 优，但**不一定**实际跑得更快。

## Kruskal 算法
Kruskal 算法能在 $O(m\log m)$ 的时间内得到一个最小生成树，主要是基于贪心的思想：
1. 将边按照边权从小到大排序，并建立一个没有边的图 $T$ 。
2. 选出一条没有被选过的边权最小的边。
3. 如果这条边两个顶点在 $T$ 中所在的连通块不相同，那么将它加入图 $T$ ，相同就跳过。
4. 重复 $2$ 和 $3$ 直到图 $T$ 连通为止。

由于只需要维护连通性，不需要真正建立图 $T$ ，可用并查集来维护。

**$Code:$**

```cpp
#include<bits/stdc++.h>
using namespace std; 

const int N = 1e6;
int n, m, f[N], sum, num;
struct edge
{
	int u, v, w;
} e[N];

int read()
{
	int x = 0; bool s = 0; char c = getchar();
	while(c < '0' || c > '9') {if(c=='-') s = 1; c = getchar();}
	while('0' <= c && c <= '9') {x = (x << 3) + (x << 1) + (c ^ 48); c = getchar();}
	return s ? -x : x;
}

bool cmp(edge x, edge y) {return x.w < y.w;}

int find(int x) {return f[x] == x ? f[x] : f[x] = find(f[x]);}

bool Kruskal()
{
	sort(e + 1, e + m + 1, cmp);  // 将边权排序
	for(int i = 1; i <= m; i++)
	{
		int x = find(e[i].u), y = find(e[i].v);
		if(x == y) continue;  // 若两点已经联通，则不需要这条边
		f[x] = y;
		sum += e[i].w;
		if(++num == n - 1) return true;  // 若已构成一颗树，即边数为点数减一时，退出操作
	}
	return false;
}

int main()
{
	n = read(), m = read();
	for(int i = 1; i <= n; i++) f[i] = i;  // 初始化并查集
	for(int i = 1; i <= m; i++) e[i].u = read(), e[i].v = read(), e[i].w = read();
	if(Kruskal()) printf("%d", sum);
	else puts("orz");
	return 0;
}
```