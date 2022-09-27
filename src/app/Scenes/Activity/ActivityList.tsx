import { ActivityList_viewer$key } from "__generated__/ActivityList_viewer.graphql"
import { ActivityQuery } from "__generated__/ActivityQuery.graphql"
import { extractNodes } from "app/utils/extractNodes"
import { Flex, Separator, Text } from "palette"
import { useState } from "react"
import { FlatList } from "react-native"
import { graphql, usePaginationFragment } from "react-relay"

interface ActivityListProps {
  viewer: ActivityList_viewer$key | null
}

export const ActivityList: React.FC<ActivityListProps> = ({ viewer }) => {
  const [refreshing, setRefreshing] = useState(false)
  const { data, hasNext, isLoadingNext, loadNext, refetch } = usePaginationFragment<
    ActivityQuery,
    ActivityList_viewer$key
  >(notificationsConnectionFragment, viewer)
  const notifications = extractNodes(data?.notificationsConnection)

  const handleLoadMore = () => {
    if (!hasNext || isLoadingNext) {
      return
    }

    loadNext(10)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    refetch(
      {},
      {
        onComplete: () => {
          setRefreshing(false)
        },
      }
    )
  }

  return (
    <FlatList
      data={notifications}
      refreshing={refreshing}
      ItemSeparatorComponent={() => <Separator />}
      renderItem={({ item }) => {
        return (
          <Flex p={2}>
            <Text>{item.title}</Text>
            <Text>{item.message}</Text>
          </Flex>
        )
      }}
      onEndReached={handleLoadMore}
      onRefresh={handleRefresh}
    />
  )
}

const notificationsConnectionFragment = graphql`
  fragment ActivityList_viewer on Viewer
  @refetchable(queryName: "ActivityList_viewerRefetch")
  @argumentDefinitions(count: { type: "Int", defaultValue: 10 }, after: { type: "String" }) {
    notificationsConnection(first: $count, after: $after)
      @connection(key: "ActivityList_notificationsConnection") {
      edges {
        node {
          title
          message
        }
      }
    }
  }
`